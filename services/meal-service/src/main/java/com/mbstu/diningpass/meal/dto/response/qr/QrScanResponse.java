package com.mbstu.diningpass.meal.dto.response.qr;

// QrScanResponse.java
public record QrScanResponse(
        boolean valid,
        String result,         // "VALID" | "ALREADY_USED" | "EXPIRED" | "WRONG_HALL"
        String mealType,
        String mealDate,
        String message
) {}
