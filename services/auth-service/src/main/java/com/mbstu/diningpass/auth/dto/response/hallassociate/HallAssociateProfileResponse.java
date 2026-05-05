package com.mbstu.diningpass.auth.dto.response.hallassociate;

import com.mbstu.diningpass.auth.enums.Role;

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