package com.mbstu.diningpass.meal.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mbstu.diningpass.meal.dto.request.qr.StaffScanRequest;
import com.mbstu.diningpass.meal.dto.response.qr.QrScanResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.QrScanService;

@WebMvcTest(QrScanController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class QrScanControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean QrScanService qrScanService;

    private UUID staffId;
    private StaffScanRequest staffScanRequest;
    private QrScanResponse qrScanResponse;

    @BeforeEach
    void init() {
        staffId = UUID.randomUUID();

        staffScanRequest = new StaffScanRequest("signed-qr-data");

        qrScanResponse = new QrScanResponse(
                true,
                "VALID",
                "LUNCH",
                LocalDate.now().toString(),
                "Meal token scanned successfully"
        );
    }

    @Test
    @DisplayName("POST /api/v1/meal-tokens/staff-scan : 200 OK - valid token")
    void shouldStaffScanSuccessfully() throws Exception {

        // GIVEN
        Mockito.when(qrScanService.staffScan(Mockito.eq(staffId), Mockito.eq(Role.HALL_STAFF), Mockito.any(StaffScanRequest.class)))
                .thenReturn(qrScanResponse);

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/meal-tokens/staff-scan")
                        .header("X-User-Id", staffId.toString())
                        .header("X-User-Role", Role.HALL_STAFF.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffScanRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.result").value("VALID"))
                .andExpect(jsonPath("$.mealType").value("LUNCH"));

        // VERIFY
        Mockito.verify(qrScanService).staffScan(Mockito.eq(staffId), Mockito.eq(Role.HALL_STAFF), Mockito.any(StaffScanRequest.class));
    }

    @Test
    @DisplayName("POST /api/v1/meal-tokens/staff-scan : 200 OK - already used token")
    void shouldReturnAlreadyUsedForReplayedToken() throws Exception {

        // GIVEN
        QrScanResponse alreadyUsed = new QrScanResponse(
                false,
                "ALREADY_USED",
                "LUNCH",
                LocalDate.now().toString(),
                "This token has already been used"
        );
        Mockito.when(qrScanService.staffScan(Mockito.eq(staffId), Mockito.eq(Role.HALL_STAFF), Mockito.any(StaffScanRequest.class)))
                .thenReturn(alreadyUsed);

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/meal-tokens/staff-scan")
                        .header("X-User-Id", staffId.toString())
                        .header("X-User-Role", Role.HALL_STAFF.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffScanRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.result").value("ALREADY_USED"));

        // VERIFY
        Mockito.verify(qrScanService).staffScan(Mockito.eq(staffId), Mockito.eq(Role.HALL_STAFF), Mockito.any(StaffScanRequest.class));
    }
}
