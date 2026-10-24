package com.localbazaar.dto;

import com.localbazaar.domain.SellerStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSellerResponse {
    private Long id;
    private String shopName;
    private String city;
    private SellerStatus status;
    private String email;
    private String ownerName;
    private long productCount;
}
