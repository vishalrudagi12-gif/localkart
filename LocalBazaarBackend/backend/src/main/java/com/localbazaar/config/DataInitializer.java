package com.localbazaar.config;

import com.localbazaar.domain.OrderStatus;
import com.localbazaar.domain.Role;
import com.localbazaar.domain.SellerStatus;
import com.localbazaar.entity.CustomerOrder;
import com.localbazaar.entity.Inventory;
import com.localbazaar.entity.OrderItem;
import com.localbazaar.entity.Product;
import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import com.localbazaar.repository.InventoryRepository;
import com.localbazaar.repository.OrderRepository;
import com.localbazaar.repository.ProductRepository;
import com.localbazaar.repository.SellerRepository;
import com.localbazaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    public static final String ADMIN_EMAIL = "admin@localbazaar.local";
    public static final String SELLER1_EMAIL = "seller@test.com";
    public static final String SELLER2_EMAIL = "pottery@test.com";
    public static final String CUSTOMER_EMAIL = "customer@test.com";
    public static final String DEMO_PASSWORD = "secret1";
    public static final String ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        User admin = ensureUser("Admin", ADMIN_EMAIL, ADMIN_PASSWORD, Role.ADMIN, true);
        User sellerUser = ensureUser("Asha Crafts", SELLER1_EMAIL, DEMO_PASSWORD, Role.SELLER, true);
        User potterUser = ensureUser("Ravi Clay", SELLER2_EMAIL, DEMO_PASSWORD, Role.SELLER, true);
        User customer = ensureUser("Demo Customer", CUSTOMER_EMAIL, DEMO_PASSWORD, Role.CUSTOMER, true);

        Seller crafts = ensureSeller(sellerUser, "City Crafts", "Pune", SellerStatus.APPROVED);
        Seller pottery = ensureSeller(potterUser, "Clay & Fire", "Jaipur", SellerStatus.APPROVED);

        Product soap = ensureProduct(crafts, "Handmade soap", "Gentle olive-oil soap for daily use.",
                "149.00", "soap", Set.of("soap", "handmade"), 10, 3);
        Product lavender = ensureProduct(crafts, "Lavender soap", "Calming lavender bar.",
                "169.00", "soap", Set.of("soap", "lavender"), 12, 3);
        Product candle = ensureProduct(crafts, "Beeswax candle", "Slow-burn beeswax pillar.",
                "299.00", "home", Set.of("home", "candle"), 8, 2);
        Product tote = ensureProduct(crafts, "Jute tote bag", "Sturdy market bag.",
                "399.00", "crafts", Set.of("bag", "jute"), 15, 4);

        Product mug = ensureProduct(pottery, "Clay mug", "Wheel-thrown mug, 300ml.",
                "249.00", "pottery", Set.of("mug", "clay"), 20, 5);
        Product plate = ensureProduct(pottery, "Dinner plate", "Speckled stoneware plate.",
                "349.00", "pottery", Set.of("plate"), 14, 4);
        Product planter = ensureProduct(pottery, "Terracotta planter", "For herbs and succulents.",
                "459.00", "home", Set.of("planter", "home"), 9, 3);
        Product incense = ensureProduct(pottery, "Incense holder", "Leaf-shaped clay holder.",
                "129.00", "home", Set.of("incense"), 18, 5);

        if (orderRepository.count() == 0) {
            seedOrder(customer, pottery, mug, 1, OrderStatus.ACCEPTED, Instant.now().minus(2, ChronoUnit.DAYS));
            seedOrder(customer, crafts, tote, 1, OrderStatus.SHIPPED, Instant.now().minus(5, ChronoUnit.HOURS));
            seedOrder(customer, crafts, candle, 1, OrderStatus.DELIVERED, Instant.now().minus(10, ChronoUnit.DAYS));
            log.info("Seeded 3 demo orders for {}", CUSTOMER_EMAIL);
        }

        log.info(
                "Demo accounts admin {} / {} | sellers {} and {} / {} | customer {} / {} | catalog {} products (soap stock {})",
                admin.getEmail(), ADMIN_PASSWORD,
                sellerUser.getEmail(), potterUser.getEmail(), DEMO_PASSWORD,
                customer.getEmail(), DEMO_PASSWORD,
                List.of(soap.getName(), lavender.getName(), candle.getName(), tote.getName(),
                        mug.getName(), plate.getName(), planter.getName(), incense.getName()).size(),
                inventoryRepository.findByProduct(soap).map(Inventory::getQuantity).orElse(0)
        );
    }

    private User ensureUser(String name, String email, String password, Role role, boolean verified) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .emailVerified(verified)
                .enabled(true)
                .build()));
    }

    private Seller ensureSeller(User user, String shopName, String city, SellerStatus status) {
        return sellerRepository.findByUser(user).orElseGet(() -> sellerRepository.save(Seller.builder()
                .user(user)
                .shopName(shopName)
                .city(city)
                .status(status)
                .description(shopName + " on LocalBazaar")
                .build()));
    }

    private Product ensureProduct(
            Seller seller,
            String name,
            String description,
            String price,
            String category,
            Set<String> tags,
            int quantity,
            int threshold
    ) {
        Product product = productRepository.findBySellerAndNameIgnoreCase(seller, name)
                .map(existing -> {
                    existing.setCategory(category);
                    existing.setDescription(description);
                    existing.setPrice(new BigDecimal(price));
                    existing.getTags().clear();
                    existing.getTags().addAll(tags);
                    return productRepository.save(existing);
                })
                .orElseGet(() -> productRepository.save(Product.builder()
                        .seller(seller)
                        .name(name)
                        .description(description)
                        .price(new BigDecimal(price))
                        .category(category)
                        .tags(tags)
                        .city(seller.getCity())
                        .active(true)
                        .build()));
        inventoryRepository.findByProduct(product).ifPresentOrElse(
                inv -> {},
                () -> inventoryRepository.save(Inventory.builder()
                        .product(product)
                        .quantity(quantity)
                        .lowStockThreshold(threshold)
                        .build())
        );
        return product;
    }

    private void seedOrder(
            User customer,
            Seller seller,
            Product product,
            int qty,
            OrderStatus status,
            Instant createdAt
    ) {
        Inventory inventory = inventoryRepository.findByProduct(product)
                .orElseThrow();
        if (inventory.getQuantity() < qty) {
            return;
        }
        inventory.setQuantity(inventory.getQuantity() - qty);
        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(qty));
        CustomerOrder order = CustomerOrder.builder()
                .customer(customer)
                .seller(seller)
                .status(status)
                .totalAmount(total)
                .shippingAddress("12 Demo Street, Pune 411001")
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();
        order.getItems().add(OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(qty)
                .unitPrice(product.getPrice())
                .build());
        orderRepository.save(order);
    }
}
