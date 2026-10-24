package com.localbazaar.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PlaceOrderRequest {
    @NotBlank
    private String shippingAddress;

    @Valid
    @NotEmpty
    private List<OrderItemRequest> items = new ArrayList<>();
}
