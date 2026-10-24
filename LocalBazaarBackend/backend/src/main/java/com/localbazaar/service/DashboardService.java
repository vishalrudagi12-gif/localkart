package com.localbazaar.service;

import com.localbazaar.dto.ProductResponse;
import com.localbazaar.dto.SellerDashboardResponse;
import com.localbazaar.dto.TopProductStat;
import com.localbazaar.entity.CustomerOrder;
import com.localbazaar.entity.Inventory;
import com.localbazaar.entity.OrderItem;
import com.localbazaar.entity.Seller;
import com.localbazaar.repository.InventoryRepository;
import com.localbazaar.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CurrentUserService currentUserService;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public SellerDashboardResponse sellerStats() {
        Seller seller = currentUserService.requireSeller(false);
        List<CustomerOrder> orders = orderRepository.findBySellerWithItems(seller);
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        Instant startToday = today.atStartOfDay(zone).toInstant();
        Instant startWeek = today.minusDays(6).atStartOfDay(zone).toInstant();
        Instant startMonth = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();

        Window todayW = sum(orders, startToday);
        Window weekW = sum(orders, startWeek);
        Window monthW = sum(orders, startMonth);
        long pending = orders.stream().filter(o -> o.getStatus().name().equals("PENDING")).count();

        Map<Long, TopAcc> top = new HashMap<>();
        for (CustomerOrder order : orders) {
            if (!OrderService.countsAsSale(order.getStatus())) {
                continue;
            }
            for (OrderItem item : order.getItems()) {
                TopAcc acc = top.computeIfAbsent(item.getProduct().getId(),
                        id -> new TopAcc(id, item.getProduct().getName()));
                acc.qty += item.getQuantity();
                acc.revenue = acc.revenue.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        List<TopProductStat> topProducts = top.values().stream()
                .sorted(Comparator.comparingLong((TopAcc a) -> a.qty).reversed())
                .limit(5)
                .map(a -> TopProductStat.builder()
                        .productId(a.productId)
                        .name(a.name)
                        .quantitySold(a.qty)
                        .revenue(a.revenue)
                        .build())
                .toList();

        List<ProductResponse> lowStock = inventoryRepository.findByProductSeller(seller).stream()
                .filter(inv -> inv.getQuantity() <= inv.getLowStockThreshold())
                .map(Inventory::getProduct)
                .map(productService::toPublicResponse)
                .toList();

        return SellerDashboardResponse.builder()
                .salesToday(todayW.amount)
                .salesWeek(weekW.amount)
                .salesMonth(monthW.amount)
                .ordersToday(todayW.count)
                .ordersWeek(weekW.count)
                .ordersMonth(monthW.count)
                .pendingOrders(pending)
                .topProducts(topProducts)
                .lowStock(lowStock)
                .build();
    }

    private static Window sum(List<CustomerOrder> orders, Instant from) {
        BigDecimal amount = BigDecimal.ZERO;
        long count = 0;
        for (CustomerOrder order : orders) {
            if (!OrderService.countsAsSale(order.getStatus())) {
                continue;
            }
            if (order.getCreatedAt() != null && !order.getCreatedAt().isBefore(from)) {
                amount = amount.add(order.getTotalAmount());
                count++;
            }
        }
        return new Window(amount, count);
    }

    private record Window(BigDecimal amount, long count) {
    }

    private static class TopAcc {
        final Long productId;
        final String name;
        long qty;
        BigDecimal revenue = BigDecimal.ZERO;

        TopAcc(Long productId, String name) {
            this.productId = productId;
            this.name = name;
        }
    }
}
