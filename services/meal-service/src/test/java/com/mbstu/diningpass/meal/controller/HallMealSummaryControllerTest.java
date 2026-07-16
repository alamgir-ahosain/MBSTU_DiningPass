package com.mbstu.diningpass.meal.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mbstu.diningpass.meal.dto.response.summary.HallMealSummaryResponse;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;

@WebMvcTest(HallMealSummaryController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class HallMealSummaryControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean HallMealSummaryService hallMealSummaryService;

    private UUID hallAdminId;
    private UUID summaryId;
    private HallMealSummaryResponse summaryResponse;

    @BeforeEach
    void init() {
        hallAdminId = UUID.randomUUID();
        summaryId = UUID.randomUUID();


        summaryResponse = new HallMealSummaryResponse(
                summaryId,
                "JAMH",
                LocalDate.now(),
                MealType.LUNCH,
                "Rice, Dal, Fish Curry, Salad",
                null,
                30L,
                100L,
                90L,
                10L,
                6000L,
                false,
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /api/v1/summary/test : 200 OK")
    void shouldReturnTestMessage() throws Exception {
        mockMvc.perform(get("/api/v1/summary/test")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/summary/hall : 200 OK")
    void shouldReturnHallSummaries() throws Exception {

        // GIVEN
        Pageable pageable = PageRequest.of(0, 20);
        Page<HallMealSummaryResponse> page = new PageImpl<>(List.of(summaryResponse), pageable, 1);

        Mockito.when(hallMealSummaryService.getAllHallMealSummary(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(0), Mockito.eq(20)))
                .thenReturn(page);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/summary/hall")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(summaryId.toString()))
                .andExpect(jsonPath("$.totalElements").value(1));

        // VERIFY
        Mockito.verify(hallMealSummaryService).getAllHallMealSummary(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(0), Mockito.eq(20));
    }
}
