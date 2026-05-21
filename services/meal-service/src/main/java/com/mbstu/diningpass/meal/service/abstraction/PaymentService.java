package com.mbstu.diningpass.meal.service.abstraction;

import com.mbstu.diningpass.meal.dto.request.payment.PaymentRejectRequest;
import com.mbstu.diningpass.meal.dto.response.payment.PaymentAdminResponse;
import com.mbstu.diningpass.meal.dto.response.payment.PaymentRejectionResponse;
import com.mbstu.diningpass.meal.dto.response.payment.PaymentResponse;
import com.mbstu.diningpass.meal.enums.Role;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface PaymentService {
    PaymentAdminResponse approvePayment(UUID requesterId, Role requesterRole, UUID paymentId) ;
    Page<PaymentResponse> getAllPayment(UUID requesterId, Role requesterRole, int page, int size) ;
    PaymentRejectionResponse rejectPayment(UUID requesterId, Role requesterRole,UUID paymentId, PaymentRejectRequest request) ;
    List<PaymentResponse> getMyPayments(UUID requesterId, Role requesterRole);



    }
