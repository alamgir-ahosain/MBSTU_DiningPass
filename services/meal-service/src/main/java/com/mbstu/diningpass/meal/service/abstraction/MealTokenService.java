package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.enums.Role;

import java.util.UUID;

public interface MealTokenService {
     CutTokenResponse cutToken(UUID studentId, Role role, CutTokenRequest request) ;

    }
