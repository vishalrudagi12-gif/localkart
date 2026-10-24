package com.localbazaar.service;

import com.localbazaar.domain.OrderStatus;
import com.localbazaar.domain.Role;
import com.localbazaar.dto.OrderItemRequest;
import com.localbazaar.dto.OrderItemResponse;
import com.localbazaar.dto.OrderResponse;
import com.localbazaar.dto.PlaceOrderRequest;
import com.localbazaar.entity.CustomerOrder;
import com.localbazaar.entity.Inventory;
import com.localbazaar.entity.OrderItem;
import com.localbazaar.entity.Product;
import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import com.localbazaar.repository.InventoryRepository;
import com.localbazaar.repository.OrderRepository;
import com.localbazaar.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<OrderStatus> COUNTED = EnumSet.of(
            OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CurrentUserService currentUserService;
    private final MailService mailService;

    @Transactional
    public List<OrderResponse> place(PlaceOrderRequest request) {
        User customer = currentUserService.requireRole(Role.CUSTOMER);
        Map<Long, List<OrderItemRequest>> bySeller = new LinkedHashMap<>();
        Map<Long, Product> products = new LinkedHashMap<>();

        for (OrderItemRequest line : request.getItems()) {
            Product product = productRepository.findById(line.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));
            if (!product.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, product.getName() + " is unavailable");
            }
            Inventory inventory = inventoryRepository.findByProduct(product)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No inventory for " + product.getName()));
            if (inventory.getQuantity() < line.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for " + product.getName() + " (have " + inventory.getQuantity() + ")");
            }
            products.put(product.getId(), product);
            bySeller.computeIfAbsent(product.getSeller().getId(), k -> new ArrayList<>()).add(line);
        }

        List<CustomerOrder> created = new ArrayList<>();
        for (List<OrderItemRequest> lines : bySeller.values()) {
            Product first = products.get(lines.get(0).getProductId());
            Seller seller = first.getSeller();
            CustomerOrder order = CustomerOrder.builder()
                    .customer(customer)
                    .seller(seller)
                    .status(OrderStatus.PENDING)
                    .shippingAddress(request.getShippingAddress().trim())
                    .totalAmount(BigDecimal.ZERO)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            BigDecimal total = BigDecimal.ZERO;
            for (OrderItemRequest line : lines) {
                Product product = products.get(line.getProductId());
                Inventory inventory = inventoryRepository.findByProduct(product).orElseThrow();
                inventory.setQuantity(inventory.getQuantity() - line.getQuantity());
                maybeLowStockAlert(product, inventory);

                OrderItem item = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(line.getQuantity())
                        .unitPrice(product.getPrice())
                        .build();
                order.getItems().add(item);
                total = total.add(product.getPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
            }
            order.setTotalAmount(total);
            created.add(orderRepository.save(order));
            notifyTransition(order, "placed (pending seller confirmation)");
        }
        return created.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> mine() {
        User user = currentUserService.requireUser();
        if (user.getRole() == Role.SELLER) {
            return sellerOrders();
        }
        return orderRepository.findByCustomerWithItems(user).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> sellerOrders() {
        Seller seller = currentUserService.requireSeller(false);
        return orderRepository.findBySellerWithItems(seller).stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus next) {
        Seller seller = currentUserService.requireSeller(true);
        CustomerOrder order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        OrderStatus current = order.getStatus();
        if (!isAllowed(current, next)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot change " + current + " to " + next);
        }
        if (next == OrderStatus.REJECTED || next == OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setStatus(next);
        order.setUpdatedAt(Instant.now());
        notifyTransition(order, next.name().toLowerCase());
        return toResponse(order);
    }

    private boolean isAllowed(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING -> next == OrderStatus.ACCEPTED || next == OrderStatus.REJECTED;
            case ACCEPTED -> next == OrderStatus.SHIPPED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            default -> false;
        };
    }

    private void restoreStock(CustomerOrder order) {
        for (OrderItem item : order.getItems()) {
            Inventory inventory = inventoryRepository.findByProduct(item.getProduct()).orElse(null);
            if (inventory != null) {
                inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
            }
        }
    }

    private void maybeLowStockAlert(Product product, Inventory inventory) {
        if (inventory.getQuantity() <= inventory.getLowStockThreshold()) {
            mailService.send(
                    product.getSeller().getUser().getEmail(),
                    "Low stock: " + product.getName(),
                    "Quantity is " + inventory.getQuantity()
                            + " (threshold " + inventory.getLowStockThreshold() + ")."
            );
        }
    }

    private void notifyTransition(CustomerOrder order, String label) {
        String subject = "Order #" + order.getId() + " " + label;
        String body = "Shop: " + order.getSeller().getShopName()
                + "\nTotal: ₹" + order.getTotalAmount()
                + "\nStatus: " + order.getStatus()
                + "\nShip to: " + order.getShippingAddress();
        mailService.send(order.getCustomer().getEmail(), subject, body);
        mailService.send(order.getSeller().getUser().getEmail(), subject, body);
    }

    public static boolean countsAsSale(OrderStatus status) {
        return COUNTED.contains(status);
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> items = order.getItems().stream().map(item -> {
            String img = item.getProduct().getImageUrls() == null || item.getProduct().getImageUrls().isEmpty()
                    ? null
                    : item.getProduct().getImageUrls().get(0);
            return OrderItemResponse.builder()
                    .productId(item.getProduct().getId())
                    .name(item.getProduct().getName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .imageUrl(img)
                    .build();
        }).toList();
        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .sellerId(order.getSeller().getId())
                .shopName(order.getSeller().getShopName())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .customerEmail(order.getCustomer().getEmail())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
