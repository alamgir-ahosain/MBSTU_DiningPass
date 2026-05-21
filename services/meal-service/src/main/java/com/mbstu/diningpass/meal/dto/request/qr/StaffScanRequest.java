package com.mbstu.diningpass.meal.dto.request.qr;

import jakarta.validation.constraints.NotBlank;

public record StaffScanRequest(
        @NotBlank(message = "QR data is required")
        String qrCodeData
) {}