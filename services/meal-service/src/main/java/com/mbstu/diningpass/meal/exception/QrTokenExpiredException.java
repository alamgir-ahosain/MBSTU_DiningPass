package com.mbstu.diningpass.meal.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// QrTokenExpiredException.java
@ResponseStatus(HttpStatus.GONE)
public class QrTokenExpiredException extends RuntimeException {
    public QrTokenExpiredException(String message) { super(message); }
}