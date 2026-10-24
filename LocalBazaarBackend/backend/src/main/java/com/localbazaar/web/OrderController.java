package com.localbazaar.web;

import com.localbazaar.dto.OrderResponse;
import com.localbazaar.dto.PlaceOrderRequest;
import com.localbazaar.dto.UpdateOrderStatusRequest;
import com.localbazaar.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @ResponseStatus(HttpStatus.CREATED)
    public List<OrderResponse> place(@Valid @RequestBody PlaceOrderRequest request) {
        return orderService.place(request);
    }

    @GetMapping("/mine")
    public List<OrderResponse> mine() {
        return orderService.mine();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public List<OrderResponse> sellerOrders() {
        return orderService.sellerOrders();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SELLER')")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.getStatus());
    }
}
