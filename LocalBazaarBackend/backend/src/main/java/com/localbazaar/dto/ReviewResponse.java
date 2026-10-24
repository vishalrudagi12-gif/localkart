package com.localbazaar.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String customerName;
    private int rating;
    private String comment;
    private Instant createdAt;
}
