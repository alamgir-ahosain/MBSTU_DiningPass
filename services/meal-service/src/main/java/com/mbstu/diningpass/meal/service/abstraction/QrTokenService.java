package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.response.qr.QrClaims;
import com.mbstu.diningpass.meal.entity.MealToken;

import java.time.LocalTime;

public interface QrTokenService {
    String generateMealQrToken(MealToken token, LocalTime tokenExpires);
    QrClaims parseAndValidate(String jwt);

}
