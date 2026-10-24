package com.localbazaar.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long productId;
    private String name;
    private int quantity;
    private BigDecimal unitPrice;
    private String imageUrl;
}
