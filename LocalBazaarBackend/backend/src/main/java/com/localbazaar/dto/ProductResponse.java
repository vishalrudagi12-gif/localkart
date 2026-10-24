package com.localbazaar.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    @Builder.Default
    private Set<String> tags = new HashSet<>();
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
    private String city;
    private boolean active;
    private Long sellerId;
    private String shopName;
    private int quantity;
    private int lowStockThreshold;
    private boolean lowStock;
    private Instant createdAt;
}
