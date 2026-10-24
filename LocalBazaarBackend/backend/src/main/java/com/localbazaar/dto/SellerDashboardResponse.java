package com.localbazaar.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class SellerDashboardResponse {
    private BigDecimal salesToday;
    private BigDecimal salesWeek;
    private BigDecimal salesMonth;
    private long ordersToday;
    private long ordersWeek;
    private long ordersMonth;
    private long pendingOrders;
    @Builder.Default
    private List<TopProductStat> topProducts = new ArrayList<>();
    @Builder.Default
    private List<ProductResponse> lowStock = new ArrayList<>();
}
