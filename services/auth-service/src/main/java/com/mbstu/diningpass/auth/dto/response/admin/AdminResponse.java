package com.mbstu.diningpass.auth.dto.response.admin;

import com.mbstu.diningpass.auth.enums.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        Role role,
        UUID hallId,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
){}
