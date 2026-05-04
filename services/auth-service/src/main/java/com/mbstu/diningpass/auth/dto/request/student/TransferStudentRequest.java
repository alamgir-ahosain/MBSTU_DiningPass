package com.mbstu.diningpass.auth.dto.request.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TransferStudentRequest(
                @NotNull(message = "New hall ID is required")
                UUID newHallId,

                @NotBlank(message = "New room number is required")
                @Size(max = 15)
                String newRoomNumber,

                @NotBlank(message = "Transfer reason is required")
                @Size(max = 255)
                String reason
        ){ }


//  5.  TransferStudentRequest(NEW — not in original lp.md)
//      PUT /api/auth/student/{id}/transfer    SUPER_ADMIN

/**
 * Move a student from one hall to another.
 *
 * Why this exists separately from UpdateStudentProfileRequest:
 *   hallId is intentionally NOT in UpdateStudentProfileRequest because
 *   students cannot change their own hall — only SUPER_ADMIN can do it.
 *
 * After transfer:
 *   • Student.hall is updated in DB
 *   • hallId in Firebase custom claims is NOT updated (we removed hallId from claims)
 *   • Downstream services (meal, payment) always fetch fresh hallId from
 *     auth-service via Feign — so they immediately see the new hall
 */