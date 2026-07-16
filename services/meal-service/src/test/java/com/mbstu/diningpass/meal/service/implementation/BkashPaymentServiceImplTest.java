package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.config.payment.BkashProperties;
import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.exception.BadRequestException;
import com.mbstu.diningpass.meal.exception.ResourceNotFoundException;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import com.mbstu.diningpass.meal.service.abstraction.BkashTokenService;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BkashPaymentServiceImplTest {

    @Mock private RestTemplate restTemplate;
    @Mock private BkashProperties props;
    @Mock private BkashTokenService bkashTokenService;
    @Mock private PaymentRepository paymentRepository;
    @Mock private MealTokenRepository mealTokenRepository;
    @Mock private MealConfigRepository mealConfigRepository;
    @Mock private StudentFeignClient studentFeignClient;
    @Mock private QrTokenService qrTokenService;
    @Mock private HallMealSummaryService hallMealSummaryService;
    @Mock private PaymentStatusService paymentStatusService;

    @InjectMocks
    private BkashPaymentServiceImpl bkashPaymentService;

    private UUID studentId;
    private StudentProfileResponse studentProfile;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        studentProfile = new StudentProfileResponse(
                "S12345", "Jane Student", "jane@mbstu.ac.bd", Role.STUDENT,
                "JAMH", "101", "CSE", null, true, null, null);
    }

    private MealConfig configFor(MealType type, LocalDate date, long price) {
        return MealConfig.builder()
                .id(UUID.randomUUID())
                .hallShortName("JAMH")
                .mealDate(date)
                .mealType(type)
                .mealMenu("Rice, Dal")
                .mealPrice(price)
                .cutTokenBefore(LocalTime.now().plusHours(2))
                .tokenExpires(LocalTime.now().plusHours(6))
                .isActive(true)
                .totalSold(0L)
                .build();
    }

    @Nested
    @DisplayName("createPayment")
    class CreatePayment {

        @Test
        @DisplayName("creates an INITIATED payment and returns bKash create details")
        void createsInitiatedPayment() {
            LocalDate mealDate = LocalDate.now();
            CutTokenRequest request = new CutTokenRequest(
                    PaymentMethod.BKASH, mealDate, List.of(MealType.LUNCH));

            MealConfig config = configFor(MealType.LUNCH, mealDate, 60L);

            when(studentFeignClient.getProfile()).thenReturn(studentProfile);
            when(mealConfigRepository.findByHallShortNameAndMealDateAndMealType("JAMH", mealDate, MealType.LUNCH))
                    .thenReturn(Optional.of(config));
            when(paymentRepository.existsMealRequest(eq(studentId), eq(mealDate), eq(MealType.LUNCH), anyList()))
                    .thenReturn(false);
            when(mealTokenRepository.existsByStudentIdAndMealDateAndMealType(studentId, mealDate, MealType.LUNCH))
                    .thenReturn(false);
            when(bkashTokenService.getValidToken()).thenReturn("bearer-token");
            when(props.getApiKey()).thenReturn("app-key");
            when(props.getCreatePaymentUrl()).thenReturn("https://bkash.test/create");
            when(props.getCallbackUrl()).thenReturn("https://backend.test/callback");

            Map<String, Object> bkashResponse = Map.of(
                    "paymentID", "PAY123",
                    "bkashURL", "https://bkash.test/checkout/PAY123"
            );
            when(restTemplate.exchange(eq("https://bkash.test/create"), eq(HttpMethod.POST),
                    any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                    .thenReturn(ResponseEntity.ok(bkashResponse));

            CutTokenResponse response = bkashPaymentService.createPayment(studentId, Role.STUDENT, request);

            assertThat(response.paymentID()).isEqualTo("PAY123");
            assertThat(response.bkashURL()).isEqualTo("https://bkash.test/checkout/PAY123");

            verify(paymentRepository).save(argThat(p ->
                    p.getPaymentStatus() == PaymentStatus.INITIATED
                            && p.getBkashPaymentId().equals("PAY123")
                            && p.getTotalAmount() == 60L
            ));
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when the meal config does not exist")
        void throwsWhenMealConfigMissing() {
            LocalDate mealDate = LocalDate.now();
            CutTokenRequest request = new CutTokenRequest(
                    PaymentMethod.BKASH, mealDate, List.of(MealType.DINNER));

            when(studentFeignClient.getProfile()).thenReturn(studentProfile);
            when(mealConfigRepository.findByHallShortNameAndMealDateAndMealType("JAMH", mealDate, MealType.DINNER))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> bkashPaymentService.createPayment(studentId, Role.STUDENT, request))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(paymentRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws BadRequestException when a pending INITIATED payment already exists")
        void throwsWhenPendingPaymentExists() {
            LocalDate mealDate = LocalDate.now();
            CutTokenRequest request = new CutTokenRequest(
                    PaymentMethod.BKASH, mealDate, List.of(MealType.LUNCH));
            MealConfig config = configFor(MealType.LUNCH, mealDate, 60L);

            when(studentFeignClient.getProfile()).thenReturn(studentProfile);
            when(mealConfigRepository.findByHallShortNameAndMealDateAndMealType("JAMH", mealDate, MealType.LUNCH))
                    .thenReturn(Optional.of(config));
            when(paymentRepository.existsMealRequest(eq(studentId), eq(mealDate), eq(MealType.LUNCH), anyList()))
                    .thenReturn(true);

            assertThatThrownBy(() -> bkashPaymentService.createPayment(studentId, Role.STUDENT, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("pending bKash session");
        }

        @Test
        @DisplayName("throws BadRequestException when a token already exists for the meal")
        void throwsWhenTokenAlreadyExists() {
            LocalDate mealDate = LocalDate.now();
            CutTokenRequest request = new CutTokenRequest(
                    PaymentMethod.BKASH, mealDate, List.of(MealType.LUNCH));
            MealConfig config = configFor(MealType.LUNCH, mealDate, 60L);

            when(studentFeignClient.getProfile()).thenReturn(studentProfile);
            when(mealConfigRepository.findByHallShortNameAndMealDateAndMealType("JAMH", mealDate, MealType.LUNCH))
                    .thenReturn(Optional.of(config));
            when(paymentRepository.existsMealRequest(eq(studentId), eq(mealDate), eq(MealType.LUNCH), anyList()))
                    .thenReturn(false);
            when(mealTokenRepository.existsByStudentIdAndMealDateAndMealType(studentId, mealDate, MealType.LUNCH))
                    .thenReturn(true);

            assertThatThrownBy(() -> bkashPaymentService.createPayment(studentId, Role.STUDENT, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Token already exists");
        }

        @Test
        @DisplayName("throws BadRequestException when the booking window is closed")
        void throwsWhenBookingWindowClosed() {
            LocalDate mealDate = LocalDate.now();
            CutTokenRequest request = new CutTokenRequest(
                    PaymentMethod.BKASH, mealDate, List.of(MealType.LUNCH));

            MealConfig closedConfig = MealConfig.builder()
                    .hallShortName("JAMH")
                    .mealDate(mealDate)
                    .mealType(MealType.LUNCH)
                    .mealPrice(60L)
                    .cutTokenBefore(LocalTime.now().minusMinutes(5)) // already passed
                    .tokenExpires(LocalTime.now().plusHours(6))
                    .isActive(true)
                    .build();

            when(studentFeignClient.getProfile()).thenReturn(studentProfile);
            when(mealConfigRepository.findByHallShortNameAndMealDateAndMealType("JAMH", mealDate, MealType.LUNCH))
                    .thenReturn(Optional.of(closedConfig));

            assertThatThrownBy(() -> bkashPaymentService.createPayment(studentId, Role.STUDENT, request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("closed");
        }
    }

    @Nested
    @DisplayName("executePayment")
    class ExecutePayment {

        @Test
        @DisplayName("marks payment COMPLETED and creates a meal token when bKash confirms 'Completed'")
        void completesPaymentAndCreatesToken() {
            String bkashPaymentId = "PAY123";
            LocalDate mealDate = LocalDate.now();

            Payment payment = Payment.builder()
                    .id(UUID.randomUUID())
                    .studentId(studentId)
                    .hallShortName("JAMH")
                    .mealDate(mealDate)
                    .mealTypes(List.of(MealType.LUNCH))
                    .totalAmount(60L)
                    .paymentMethod(PaymentMethod.BKASH)
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.INITIATED)
                    .build();

            MealConfig config = configFor(MealType.LUNCH, mealDate, 60L);

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));
            when(bkashTokenService.getValidToken()).thenReturn("bearer-token");
            when(props.getApiKey()).thenReturn("app-key");
            when(props.getExecutePaymentUrl()).thenReturn("https://bkash.test/execute");

            Map<String, Object> executeResponse = Map.of(
                    "transactionStatus", "Completed",
                    "trxID", "TRX999",
                    "customerMsisdn", "01700000000"
            );
            when(restTemplate.exchange(eq("https://bkash.test/execute"), eq(HttpMethod.POST),
                    any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                    .thenReturn(ResponseEntity.ok(executeResponse));

            when(paymentStatusService.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(mealConfigRepository.findByHallShortNameAndMealDateAndMealType("JAMH", mealDate, MealType.LUNCH))
                    .thenReturn(Optional.of(config));
            when(mealTokenRepository.save(any())).thenAnswer(inv -> {
                var token = inv.getArgument(0, com.mbstu.diningpass.meal.entity.MealToken.class);
                token.setId(UUID.randomUUID());
                return token;
            });
            when(qrTokenService.generateMealQrToken(any(), any())).thenReturn("qr-jwt");

            BkashExecutePaymentResponse response = bkashPaymentService.executePayment(bkashPaymentId);

            assertThat(response.transactionStatus()).isEqualTo("Completed");
            assertThat(response.trxID()).isEqualTo("TRX999");
            assertThat(response.internalStatus()).isEqualTo(PaymentStatus.COMPLETED);

            verify(paymentStatusService).save(argThat(p -> p.getPaymentStatus() == PaymentStatus.COMPLETED));
            verify(mealTokenRepository, times(2)).save(any()); // initial save + qr update save
            verify(hallMealSummaryService).onPaymentApproved(eq("JAMH"), eq(mealDate), eq(MealType.LUNCH),
                    eq(60L), anyString(), any());
        }

        @Test
        @DisplayName("marks payment FAILED when bKash does not confirm 'Completed'")
        void marksPaymentFailedOnNonCompletedStatus() {
            String bkashPaymentId = "PAY456";
            Payment payment = Payment.builder()
                    .id(UUID.randomUUID())
                    .studentId(studentId)
                    .hallShortName("JAMH")
                    .mealDate(LocalDate.now())
                    .mealTypes(List.of(MealType.DINNER))
                    .totalAmount(70L)
                    .paymentMethod(PaymentMethod.BKASH)
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.INITIATED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));
            when(bkashTokenService.getValidToken()).thenReturn("bearer-token");
            when(props.getApiKey()).thenReturn("app-key");
            when(props.getExecutePaymentUrl()).thenReturn("https://bkash.test/execute");

            Map<String, Object> executeResponse = Map.of("transactionStatus", "Failed");
            when(restTemplate.exchange(eq("https://bkash.test/execute"), eq(HttpMethod.POST),
                    any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                    .thenReturn(ResponseEntity.ok(executeResponse));
            when(paymentStatusService.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            BkashExecutePaymentResponse response = bkashPaymentService.executePayment(bkashPaymentId);

            assertThat(response.internalStatus()).isEqualTo(PaymentStatus.FAILED);
            verify(mealTokenRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws BadRequestException as an idempotency guard when payment is not INITIATED")
        void throwsWhenAlreadyProcessed() {
            String bkashPaymentId = "PAY789";
            Payment payment = Payment.builder()
                    .id(UUID.randomUUID())
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.COMPLETED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));

            assertThatThrownBy(() -> bkashPaymentService.executePayment(bkashPaymentId))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("already processed");

            verify(restTemplate, never()).exchange(anyString(), any(), any(), any(ParameterizedTypeReference.class));
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when the payment id is unknown")
        void throwsWhenPaymentNotFound() {
            when(paymentRepository.findByBkashPaymentId("UNKNOWN")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bkashPaymentService.executePayment("UNKNOWN"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("cancelPayment")
    class CancelPayment {

        @Test
        @DisplayName("marks an INITIATED payment as FAILED")
        void marksInitiatedAsFailed() {
            String bkashPaymentId = "PAY111";
            Payment payment = Payment.builder()
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.INITIATED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));

            Map<String, Object> result = bkashPaymentService.cancelPayment(bkashPaymentId);

            assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.FAILED);
            assertThat(result.get("status")).isEqualTo("FAILED");
            verify(paymentRepository).save(payment);
        }

        @Test
        @DisplayName("throws BadRequestException when trying to cancel a COMPLETED payment")
        void throwsWhenCancellingCompletedPayment() {
            String bkashPaymentId = "PAY222";
            Payment payment = Payment.builder()
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.COMPLETED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));

            assertThatThrownBy(() -> bkashPaymentService.cancelPayment(bkashPaymentId))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Use refund instead");
        }

        @Test
        @DisplayName("throws BadRequestException when trying to cancel a REFUNDED payment")
        void throwsWhenCancellingRefundedPayment() {
            String bkashPaymentId = "PAY333";
            Payment payment = Payment.builder()
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.REFUNDED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));

            assertThatThrownBy(() -> bkashPaymentService.cancelPayment(bkashPaymentId))
                    .isInstanceOf(BadRequestException.class);
        }
    }

    @Nested
    @DisplayName("refundPayment")
    class RefundPayment {

        @Test
        @DisplayName("refunds a COMPLETED payment and marks it REFUNDED")
        void refundsCompletedPayment() {
            String bkashPaymentId = "PAY444";
            Payment payment = Payment.builder()
                    .bkashPaymentId(bkashPaymentId)
                    .bkashTrxId("TRX444")
                    .totalAmount(60L)
                    .paymentStatus(PaymentStatus.COMPLETED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));
            when(bkashTokenService.getValidToken()).thenReturn("bearer-token");
            when(props.getApiKey()).thenReturn("app-key");
            when(props.getRefundUrl()).thenReturn("https://bkash.test/refund");

            Map<String, Object> refundResponse = Map.of("status", "completed", "refundTrxID", "RF1");
            when(restTemplate.exchange(eq("https://bkash.test/refund"), eq(HttpMethod.POST),
                    any(HttpEntity.class), any(ParameterizedTypeReference.class)))
                    .thenReturn(ResponseEntity.ok(refundResponse));

            Map<String, Object> result = bkashPaymentService.refundPayment(bkashPaymentId);

            assertThat(result.get("refundTrxID")).isEqualTo("RF1");
            assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.REFUNDED);
            verify(paymentRepository).save(payment);
        }

        @Test
        @DisplayName("throws BadRequestException when trying to refund a non-COMPLETED payment")
        void throwsWhenRefundingNonCompletedPayment() {
            String bkashPaymentId = "PAY555";
            Payment payment = Payment.builder()
                    .bkashPaymentId(bkashPaymentId)
                    .paymentStatus(PaymentStatus.INITIATED)
                    .build();

            when(paymentRepository.findByBkashPaymentId(bkashPaymentId)).thenReturn(Optional.of(payment));

            assertThatThrownBy(() -> bkashPaymentService.refundPayment(bkashPaymentId))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Only COMPLETED payments");

            verify(restTemplate, never()).exchange(anyString(), any(), any(), any(ParameterizedTypeReference.class));
        }
    }
}
