package com.mbstu.diningpass.meal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class QrTokenInvalidException extends RuntimeException {
    public QrTokenInvalidException(String message) { super(message); }
}