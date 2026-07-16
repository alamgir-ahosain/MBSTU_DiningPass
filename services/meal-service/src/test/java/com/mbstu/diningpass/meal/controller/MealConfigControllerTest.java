package com.mbstu.diningpass.meal.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.mbstu.diningpass.meal.dto.request.mealconfig.CreateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.request.mealconfig.UpdateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.response.mealconfig.MealConfigAdminResponse;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.MealConfigService;

@WebMvcTest(MealConfigController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class MealConfigControllerTest {

    @Autowired private MockMvc mockMvc;
    // findAndRegisterModules() registers JavaTimeModule so LocalDate/LocalTime/LocalDateTime
    // fields (present in CreateMealConfigRequest, UpdateMealConfigRequest, MealConfigAdminResponse)
    // serialize/deserialize correctly instead of throwing InvalidDefinitionException.
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @MockitoBean MealConfigService mealConfigService;

    private UUID hallAdminId;
    private UUID configId;
    private CreateMealConfigRequest createMealConfigRequest;
    private UpdateMealConfigRequest updateMealConfigRequest;
    private MealConfigAdminResponse mealConfigAdminResponse;

    @BeforeEach
    void init() {
        hallAdminId = UUID.randomUUID();
        configId = UUID.randomUUID();

        // CreateMealConfigRequest: mealDate, mealType, mealMenu, mealPrice, cutTokenBefore, tokenExpires, feastNote
        // (hallShortName is NOT part of this request — resolved server-side from the requester)
        createMealConfigRequest = new CreateMealConfigRequest(
                LocalDate.now().plusDays(1),
                MealType.LUNCH,
                "Rice, Dal, Fish Curry, Salad",
                30L,
                LocalTime.of(23, 59),
                LocalTime.of(14, 30),
                "Eid Special"
        );

        // UpdateMealConfigRequest: mealMenu, mealPrice, cutTokenBefore, tokenExpires, isActive, feastNote
        updateMealConfigRequest = new UpdateMealConfigRequest(
                "Rice, Dal, Egg Curry, Salad",
                40L,
                LocalTime.of(23, 59),
                LocalTime.of(14, 30),
                true,
                "Eid Special"
        );

        // MealConfigAdminResponse: id, hallShortName, mealDate, mealType, mealMenu, mealPrice,
        // cutTokenBefore, tokenExpires, isActive, feastNote, totalTokensSold, totalTokensUsed,
        // totalTokenPending, isBookingOpen, createdByName, updatedByName, createdAt, updatedAt
        mealConfigAdminResponse = new MealConfigAdminResponse(
                configId,
                "JAMH",
                LocalDate.now().plusDays(1),
                MealType.LUNCH,
                "Rice, Dal, Fish Curry, Salad",
                30L,
                LocalTime.of(23, 59),
                LocalTime.of(14, 30),
                true,
                "Eid Special",
                0L,
                0L,
                0L,
                true,
                "JAMH Hall Provost",
                "JAMH Hall Provost",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /api/v1/meal-configs/test : 200 OK")
    void shouldReturnTestMessage() throws Exception {
        mockMvc.perform(get("/api/v1/meal-configs/test")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/v1/meal-configs : 201 CREATED")
    void shouldCreateMealConfigSuccessfully() throws Exception {

        // GIVEN
        Mockito.when(mealConfigService.createMealConfig(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.any(CreateMealConfigRequest.class)))
                .thenReturn(mealConfigAdminResponse);

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/meal-configs")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createMealConfigRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(configId.toString()))
                .andExpect(jsonPath("$.hallShortName").value("JAMH"))
                .andExpect(jsonPath("$.mealType").value("LUNCH"));

        // VERIFY
        Mockito.verify(mealConfigService).createMealConfig(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.any(CreateMealConfigRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/meal-configs : 200 OK")
    void shouldReturnAllMealConfigs() throws Exception {

        // GIVEN
        Mockito.when(mealConfigService.getAllMealConfigs(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN)))
                .thenReturn(List.of(mealConfigAdminResponse));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/meal-configs")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(configId.toString()))
                .andExpect(jsonPath("$[0].hallShortName").value("JAMH"));

        // VERIFY
        Mockito.verify(mealConfigService).getAllMealConfigs(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN));
    }

    @Test
    @DisplayName("PUT /api/v1/meal-configs/{configId} : 200 OK")
    void shouldUpdateMealConfigSuccessfully() throws Exception {

        // GIVEN
        MealConfigAdminResponse updated = new MealConfigAdminResponse(
                configId,
                "JAMH",
                LocalDate.now().plusDays(1),
                MealType.LUNCH,
                "Rice, Dal, Egg Curry, Salad",
                40L,
                LocalTime.of(23, 59),
                LocalTime.of(14, 30),
                true,
                "Eid Special",
                0L,
                0L,
                0L,
                true,
                "JAMH Hall Provost",
                "JAMH Hall Provost",
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        Mockito.when(mealConfigService.updateMealConfig(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(configId), Mockito.any(UpdateMealConfigRequest.class)))
                .thenReturn(updated);

        // WHEN & THEN
        mockMvc.perform(put("/api/v1/meal-configs/{configId}", configId)
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateMealConfigRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mealMenu").value("Rice, Dal, Egg Curry, Salad"))
                .andExpect(jsonPath("$.mealPrice").value(40));

        // VERIFY
        Mockito.verify(mealConfigService).updateMealConfig(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(configId), Mockito.any(UpdateMealConfigRequest.class));
    }
}