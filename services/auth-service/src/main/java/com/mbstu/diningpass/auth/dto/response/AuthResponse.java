package com.mbstu.diningpass.auth.dto.response;

public record AuthResponse(

        String  accessToken,
        String  refreshToken,
        String  tokenType,          // "Bearer"
        Long    expiresIn,          // seconds

        String  role,               // "STUDENT" | "HALL_ADMIN" | "SUPER_ADMIN" | "COUNTER_STAFF"
        String  userId,
        String  fullName,
        String  hallId,
        String  hallName
) { }
