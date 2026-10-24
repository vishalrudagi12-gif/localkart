package com.localbazaar.dto;

import com.localbazaar.domain.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean emailVerified;
}
