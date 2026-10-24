package com.localbazaar.web;

import com.localbazaar.domain.SellerStatus;
import com.localbazaar.dto.AdminSellerResponse;
import com.localbazaar.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sellers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public List<AdminSellerResponse> list() {
        return adminService.listSellers();
    }

    @PostMapping("/{id}/approve")
    public AdminSellerResponse approve(@PathVariable Long id) {
        return adminService.setStatus(id, SellerStatus.APPROVED);
    }

    @PostMapping("/{id}/reject")
    public AdminSellerResponse reject(@PathVariable Long id) {
        return adminService.setStatus(id, SellerStatus.REJECTED);
    }
}
