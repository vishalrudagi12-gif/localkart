package com.localbazaar.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TopProductStat {
    private Long productId;
    private String name;
    private long quantitySold;
    private BigDecimal revenue;
}
