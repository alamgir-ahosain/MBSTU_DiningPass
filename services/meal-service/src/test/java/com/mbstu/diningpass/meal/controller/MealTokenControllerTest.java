package com.mbstu.diningpass.meal.controller;

import static java.util.Arrays.asList;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mbstu.diningpass.meal.dto.response.mealtoken.MealTokenStudentResponse;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.service.abstraction.MealTokenService;

@WebMvcTest(MealTokenController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class MealTokenControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean MealTokenService mealTokenService;

    private UUID studentId;
    private UUID tokenId;
    private MealTokenStudentResponse tokenResponse;

    @BeforeEach
    void init() {
        studentId = UUID.randomUUID();
        tokenId = UUID.randomUUID();

        tokenResponse = new MealTokenStudentResponse(
                tokenId,
                LocalDate.now().plusDays(1),
                MealType.LUNCH,
                "Rice, Dal, Fish Curry, Salad",
                "02:30 PM",
                TokenStatus.APPROVED,
                "signed-qr-data"
        );
    }

    @Test
    @DisplayName("GET /api/v1/meal-tokens/test : 200 OK")
    void shouldReturnTestMessage() throws Exception {
        mockMvc.perform(get("/api/v1/meal-tokens/test")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/meal-tokens/my : 200 OK")
    void shouldReturnMyMealTokens() throws Exception {

        // GIVEN
        Mockito.when(mealTokenService.getMyMealToken(Mockito.eq(studentId), Mockito.eq(Role.STUDENT)))
                .thenReturn(asList(tokenResponse));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/meal-tokens/my")
                        .header("X-User-Id", studentId.toString())
                        .header("X-User-Role", Role.STUDENT.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(tokenId.toString()))
                .andExpect(jsonPath("$[0].mealType").value("LUNCH"))
                .andExpect(jsonPath("$[0].tokenStatus").value("APPROVED"));

        // VERIFY
        Mockito.verify(mealTokenService).getMyMealToken(Mockito.eq(studentId), Mockito.eq(Role.STUDENT));
    }
}
