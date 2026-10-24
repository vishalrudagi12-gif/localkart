package com.localbazaar.dto;

import com.localbazaar.domain.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private Long sellerId;
    private String shopName;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
