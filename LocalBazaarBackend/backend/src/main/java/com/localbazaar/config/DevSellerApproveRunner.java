package com.localbazaar.config;

import com.localbazaar.domain.SellerStatus;
import com.localbazaar.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DevSellerApproveRunner implements CommandLineRunner {

    private final SellerRepository sellerRepository;

    @Value("${app.dev.auto-approve-sellers:false}")
    private boolean autoApproveSellers;

    @Override
    @Transactional
    public void run(String... args) {
        if (!autoApproveSellers) {
            return;
        }
        sellerRepository.findAll().stream()
                .filter(s -> s.getStatus() != SellerStatus.APPROVED)
                .forEach(s -> s.setStatus(SellerStatus.APPROVED));
    }
}
