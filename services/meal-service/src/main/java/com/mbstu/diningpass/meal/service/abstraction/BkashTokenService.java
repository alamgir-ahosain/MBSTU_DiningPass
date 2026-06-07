package com.mbstu.diningpass.meal.service.abstraction;

public interface BkashTokenService {

    String getValidToken();
    String grantToken();
    String refreshToken();
}
