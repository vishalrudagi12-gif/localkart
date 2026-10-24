package com.localbazaar.service;

import com.localbazaar.domain.Role;
import com.localbazaar.domain.SellerStatus;
import com.localbazaar.dto.AdminSellerResponse;
import com.localbazaar.entity.Seller;
import com.localbazaar.repository.ProductRepository;
import com.localbazaar.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CurrentUserService currentUserService;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final MailService mailService;

    @Transactional(readOnly = true)
    public List<AdminSellerResponse> listSellers() {
        currentUserService.requireRole(Role.ADMIN);
        return sellerRepository.findAllWithUser().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AdminSellerResponse setStatus(Long sellerId, SellerStatus status) {
        currentUserService.requireRole(Role.ADMIN);
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
        seller.setStatus(status);
        mailService.send(
                seller.getUser().getEmail(),
                "Seller account " + status.name().toLowerCase(),
                "Your shop \"" + seller.getShopName() + "\" is now " + status + "."
        );
        return toResponse(seller);
    }

    private AdminSellerResponse toResponse(Seller seller) {
        return AdminSellerResponse.builder()
                .id(seller.getId())
                .shopName(seller.getShopName())
                .city(seller.getCity())
                .status(seller.getStatus())
                .email(seller.getUser().getEmail())
                .ownerName(seller.getUser().getName())
                .productCount(productRepository.countBySeller(seller))
                .build();
    }
}
