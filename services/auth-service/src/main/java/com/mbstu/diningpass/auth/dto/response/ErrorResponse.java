package com.mbstu.diningpass.auth.dto.response;

import java.time.LocalDateTime;

public record ErrorResponse (
        LocalDateTime timestamp,
        int status,
        String error,
        String message
){ }
