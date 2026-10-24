package com.localbazaar.web;

import com.localbazaar.dto.ProductResponse;
import com.localbazaar.dto.SellerMeResponse;
import com.localbazaar.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    private final ProductService productService;

    @GetMapping("/me")
    public SellerMeResponse me() {
        return productService.me();
    }

    @GetMapping("/products")
    public List<ProductResponse> myProducts() {
        return productService.myProducts();
    }
}
