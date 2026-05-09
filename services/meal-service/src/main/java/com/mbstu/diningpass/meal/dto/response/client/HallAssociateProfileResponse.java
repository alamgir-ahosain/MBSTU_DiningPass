package com.mbstu.diningpass.meal.dto.response.client;

import com.mbstu.diningpass.meal.enums.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record HallAssociateProfileResponse (
        String fullName,
        String email,
        String phone,
        Role role,
        String hallShortName,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
){}