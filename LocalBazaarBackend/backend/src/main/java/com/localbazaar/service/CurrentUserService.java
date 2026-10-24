package com.localbazaar.service;

import com.localbazaar.domain.Role;
import com.localbazaar.domain.SellerStatus;
import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import com.localbazaar.repository.SellerRepository;
import com.localbazaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    public User requireUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required"));
    }

    public User requireRole(Role role) {
        User user = requireUser();
        if (user.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Requires " + role + " role");
        }
        return user;
    }

    public Seller requireSeller(boolean mustBeApproved) {
        User user = requireRole(Role.SELLER);
        Seller seller = sellerRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller account required"));
        if (mustBeApproved && seller.getStatus() != SellerStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller account is not approved yet");
        }
        return seller;
    }
}
