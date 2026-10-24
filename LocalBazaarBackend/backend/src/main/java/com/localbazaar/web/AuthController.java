package com.localbazaar.web;

import com.localbazaar.dto.AuthResponse;
import com.localbazaar.dto.LoginRequest;
import com.localbazaar.dto.RegisterRequest;
import com.localbazaar.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/verify")
    public Map<String, String> verify(@RequestParam String token) {
        authService.verifyEmail(token);
        return Map.of("message", "Email verified");
    }

    @GetMapping("/me")
    public AuthResponse me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Login required");
        }
        return authService.me(user.getUsername());
    }
}
