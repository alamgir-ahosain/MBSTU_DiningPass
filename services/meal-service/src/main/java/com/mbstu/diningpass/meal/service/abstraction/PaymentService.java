package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.payment.PaymentAdminResponse;
import com.mbstu.diningpass.meal.dto.response.payment.PaymentResponse;
import com.mbstu.diningpass.meal.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PaymentService {
    PaymentAdminResponse approvePayment(UUID requesterId, Role requesterRole, UUID paymentId) ;
    Page<PaymentResponse> getAllPayment(UUID requesterId, Role requesterRole, int page, int size) ;


    }
