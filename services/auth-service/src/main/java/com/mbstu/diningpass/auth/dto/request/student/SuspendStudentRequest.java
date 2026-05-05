package com.mbstu.diningpass.auth.dto.request.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SuspendStudentRequest (
    @NotBlank(message = "Suspension reason is required")
    @Size(max = 255, message = "Reason too long")
    String reason
){}


// ══════════════════════════════════════════════════════════════════════════════
//  4.  SuspendStudentRequest
//      PUT /api/admin/users/students/{id}/suspend    HALL_ADMIN
//      (called via user-service → Feign → auth-service internal endpoint)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * HALL_ADMIN provides a reason when suspending a student.
 * The reason is logged but not stored in the Student entity (add a
 * suspensionReason column to the entity if you want to show it in the UI).
 *
 * Suspension also disables the Firebase account so the student's
 * current tokens are invalidated immediately — they cannot log in
 * until the account is re-activated.
 */