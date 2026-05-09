package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.Role;

import java.time.LocalTime;
import java.util.UUID;

public interface QrTokenService {
    String generateMealQrToken(MealToken token, LocalTime tokenExpires);
}
