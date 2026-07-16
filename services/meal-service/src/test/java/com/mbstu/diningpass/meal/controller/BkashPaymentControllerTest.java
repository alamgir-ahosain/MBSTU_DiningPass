package com.mbstu.diningpass.meal.controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;
import java.util.UUID;

import com.mbstu.diningpass.meal.config.SecurityConfig;
import com.mbstu.diningpass.meal.config.redis.NoRedisConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.request.payment.BkashRefundRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.payment.BkashExecutePaymentResponse;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentMethod;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.BkashPaymentService;

import java.time.LocalDate;
import java.util.List;

@WebMvcTest(BkashPaymentController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
@TestPropertySource(properties = "app.frontend.url=http://localhost:3000")
public class BkashPaymentControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules(); // needed for CutTokenRequest's LocalDate field

    @MockitoBean BkashPaymentService bkashPaymentService;

    private UUID studentId;
    private CutTokenRequest cutTokenRequest;
    private CutTokenResponse cutTokenResponse;

    @BeforeEach
    void init() {
        studentId = UUID.randomUUID();

        cutTokenRequest = new CutTokenRequest(
                PaymentMethod.BKASH,
                LocalDate.now().plusDays(1),
                List.of(MealType.LUNCH)
        );

        // Matches the bKash test-domain convention used in BkashPaymentServiceImplTest
        // (props.getCreatePaymentUrl() -> "https://bkash.test/create", paymentID -> "PAY123")
        cutTokenResponse = new CutTokenResponse("PAY123", "https://bkash.test/checkout/PAY123");
    }

    // ── STEP 1: Create ──────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/payment/bkash/create : 200 OK")
    void shouldCreatePaymentSuccessfully() throws Exception {

        // GIVEN
        Mockito.when(bkashPaymentService.createPayment(Mockito.eq(studentId), Mockito.eq(Role.STUDENT), Mockito.any(CutTokenRequest.class)))
                .thenReturn(cutTokenResponse);

        // WHEN & THEN
        mockMvc.perform(post("/api/payment/bkash/create")
                        .header("X-User-Id", studentId.toString())
                        .header("X-User-Role", Role.STUDENT.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cutTokenRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentID").value("PAY123"))
                .andExpect(jsonPath("$.bkashURL").value("https://bkash.test/checkout/PAY123"));

        // VERIFY
        Mockito.verify(bkashPaymentService).createPayment(Mockito.eq(studentId), Mockito.eq(Role.STUDENT), Mockito.any(CutTokenRequest.class));
    }

    // ── STEP 2: Callback ─────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/payment/bkash/callback?status=success : 302 redirect to success page")
    void shouldRedirectToSuccessPageOnSuccessfulExecute() throws Exception {

        // GIVEN
        BkashExecutePaymentResponse executeResponse =
                new BkashExecutePaymentResponse("Completed", "TRX444", PaymentStatus.COMPLETED);
        Mockito.when(bkashPaymentService.executePayment("PAY123")).thenReturn(executeResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/payment/bkash/callback")
                        .param("paymentID", "PAY123")
                        .param("status", "success"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", containsString("http://localhost:3000/payment/success")))
                .andExpect(header().string("Location", containsString("paymentID=PAY123")))
                .andExpect(header().string("Location", containsString("trxID=TRX444")))
                .andExpect(header().string("Location", containsString("status=COMPLETED")));

        // VERIFY
        Mockito.verify(bkashPaymentService).executePayment("PAY123");
    }

    @Test
    @DisplayName("GET /api/payment/bkash/callback?status=success but not completed : 302 redirect to failure page")
    void shouldRedirectToFailurePageWhenExecuteNotCompleted() throws Exception {

        // GIVEN
        BkashExecutePaymentResponse executeResponse =
                new BkashExecutePaymentResponse("Failed", null, PaymentStatus.FAILED);
        Mockito.when(bkashPaymentService.executePayment("PAY456")).thenReturn(executeResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/payment/bkash/callback")
                        .param("paymentID", "PAY456")
                        .param("status", "success"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", containsString("http://localhost:3000/payment/failure")))
                .andExpect(header().string("Location", containsString("paymentID=PAY456")));
    }

    @Test
    @DisplayName("GET /api/payment/bkash/callback?status=cancel : 302 redirect to failure page and marks payment FAILED")
    void shouldRedirectToFailurePageOnCancel() throws Exception {

        // GIVEN
        Mockito.when(bkashPaymentService.cancelPayment("PAY111")).thenReturn(Map.of("status", "FAILED"));

        // WHEN & THEN
        mockMvc.perform(get("/api/payment/bkash/callback")
                        .param("paymentID", "PAY111")
                        .param("status", "cancel"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", containsString("http://localhost:3000/payment/failure")))
                .andExpect(header().string("Location", containsString("message=cancel")));

        // VERIFY
        Mockito.verify(bkashPaymentService).cancelPayment("PAY111");
    }

    @Test
    @DisplayName("GET /api/payment/bkash/callback?status=failure : 302 redirect to failure page")
    void shouldRedirectToFailurePageOnFailureStatus() throws Exception {

        // GIVEN
        Mockito.when(bkashPaymentService.cancelPayment("PAY222")).thenReturn(Map.of("status", "FAILED"));

        // WHEN & THEN
        mockMvc.perform(get("/api/payment/bkash/callback")
                        .param("paymentID", "PAY222")
                        .param("status", "failure"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", containsString("http://localhost:3000/payment/failure")));
    }

    @Test
    @DisplayName("GET /api/payment/bkash/callback without paymentID : 302 redirect to failure page")
    void shouldRedirectToFailurePageWhenPaymentIdMissing() throws Exception {

        // WHEN & THEN
        mockMvc.perform(get("/api/payment/bkash/callback")
                        .param("status", "success"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", containsString("message=missing_payment_id")));

        // VERIFY
        Mockito.verifyNoInteractions(bkashPaymentService);
    }

    @Test
    @DisplayName("GET /api/payment/bkash/callback with unknown status : 302 redirect to failure page")
    void shouldRedirectToFailurePageForUnknownStatus() throws Exception {

        // WHEN & THEN
        mockMvc.perform(get("/api/payment/bkash/callback")
                        .param("paymentID", "PAY333")
                        .param("status", "weird"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", containsString("message=unknown_status")));
    }

    // ── STEP 3: Refund ───────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/payment/bkash/refund : 200 OK")
    void shouldRefundPaymentSuccessfully() throws Exception {

        // GIVEN
        BkashRefundRequest request = new BkashRefundRequest("PAY123");
        Mockito.when(bkashPaymentService.refundPayment("PAY123"))
                .thenReturn(Map.of("refundTrxID", "RF1", "status", "completed"));

        // WHEN & THEN
        mockMvc.perform(post("/api/payment/bkash/refund")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.refundTrxID").value("RF1"))
                .andExpect(jsonPath("$.status").value("completed"));

        // VERIFY
        Mockito.verify(bkashPaymentService).refundPayment("PAY123");
    }

    // ── Cancel (student-initiated, pre-redirect) ────────────────────────

    @Test
    @DisplayName("POST /api/payment/bkash/cancel : 200 OK")
    void shouldCancelPaymentSuccessfully() throws Exception {

        // GIVEN
        BkashRefundRequest request = new BkashRefundRequest("PAY123");
        Mockito.when(bkashPaymentService.cancelPayment("PAY123"))
                .thenReturn(Map.of("status", "FAILED"));

        // WHEN & THEN
        mockMvc.perform(post("/api/payment/bkash/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FAILED"));

        // VERIFY
        Mockito.verify(bkashPaymentService).cancelPayment("PAY123");
    }
}