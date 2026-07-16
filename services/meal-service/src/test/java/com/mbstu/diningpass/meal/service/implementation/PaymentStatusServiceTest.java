package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import com.mbstu.diningpass.meal.repository.PaymentRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentStatusServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentStatusService paymentStatusService;

    @Test
    @DisplayName("delegates straight to the repository and returns the saved entity")
    void savesAndReturnsPayment() {
        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .studentId(UUID.randomUUID())
                .hallShortName("JAMH")
                .paymentMethod(PaymentMethod.BKASH)
                .totalAmount(120L)
                .bkashPaymentId("TR0001")
                .paymentStatus(PaymentStatus.COMPLETED)
                .build();

        when(paymentRepository.save(payment)).thenReturn(payment);

        Payment result = paymentStatusService.save(payment);

        assertThat(result).isSameAs(payment);
        verify(paymentRepository).save(payment);
    }
}
