package com.localbazaar.web;

import com.localbazaar.dto.SellerDashboardResponse;
import com.localbazaar.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public SellerDashboardResponse seller() {
        return dashboardService.sellerStats();
    }
}
