package com.mbstu.diningpass.auth.dto.request.student;

import jakarta.validation.constraints.NotBlank;

public record FcmTokenUpdateRequest(
        @NotBlank(message = "FCM token is required")
        String fcmToken
) {
}
