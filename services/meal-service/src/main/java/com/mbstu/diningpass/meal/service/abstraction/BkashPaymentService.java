package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
import com.mbstu.diningpass.meal.enums.Role;

import java.util.Map;
import java.util.UUID;

public interface BkashPaymentService {

    CutTokenResponse createPayment(UUID studentId, Role role, CutTokenRequest request);
    BkashExecutePaymentResponse executePayment(String bkashPaymentId);
    Map<String, Object> cancelPayment(String bkashPaymentId);
    Map<String, Object> refundPayment(String bkashPaymentId);

}
