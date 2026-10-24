package com.localbazaar.service;

import com.localbazaar.domain.Role;
import com.localbazaar.domain.SellerStatus;
import com.localbazaar.dto.AuthResponse;
import com.localbazaar.dto.LoginRequest;
import com.localbazaar.dto.RegisterRequest;
import com.localbazaar.entity.Seller;
import com.localbazaar.entity.User;
import com.localbazaar.repository.SellerRepository;
import com.localbazaar.repository.UserRepository;
import com.localbazaar.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;

    @Value("${app.dev.auto-approve-sellers:false}")
    private boolean autoApproveSellers;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Role role = request.getRole();
        if (role == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot self-register as admin");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .emailVerified(false)
                .verificationToken(UUID.randomUUID().toString())
                .enabled(true)
                .build();
        userRepository.save(user);

        if (role == Role.SELLER) {
            String shop = (request.getShopName() == null || request.getShopName().isBlank())
                    ? user.getName() + "'s shop"
                    : request.getShopName().trim();
            sellerRepository.save(Seller.builder()
                    .user(user)
                    .shopName(shop)
                    .city(request.getCity())
                    .status(autoApproveSellers ? SellerStatus.APPROVED : SellerStatus.PENDING)
                    .build());
        }

        mailService.send(
                user.getEmail(),
                "Verify your LocalBazaar email",
                "Welcome to LocalBazaar.\nVerify: http://localhost:8080/api/auth/verify?token="
                        + user.getVerificationToken()
        );
        return toResponse(user, jwtService.generateToken(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account disabled");
        }
        return toResponse(user, jwtService.generateToken(user));
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
    }

    public AuthResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not found"));
        return toResponse(user, null);
    }

    private AuthResponse toResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .build();
    }
}
