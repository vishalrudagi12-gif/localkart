package com.localbazaar.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    private String category;

    private List<String> tags = new ArrayList<>();

    private String city;

    @Min(0)
    private int quantity = 0;

    @Min(0)
    private int lowStockThreshold = 5;
}
