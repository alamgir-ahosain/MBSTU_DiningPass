package com.mbstu.diningpass.auth.controller;

import static java.util.Arrays.asList;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import com.mbstu.diningpass.auth.config.SecurityConfig;
import com.mbstu.diningpass.auth.config.redis.NoRedisConfig;
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
import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.service.abstraction.HallService;

@WebMvcTest(HallController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class HallControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();   // manually instantiated

    @MockitoBean HallService hallService;

    private UUID superAdminId;
    private UUID hallId;
    private CreateHallRequest createHallRequest;
    private HallResponse hallResponse;

    @BeforeEach
    void init() {
        superAdminId = UUID.randomUUID();
        hallId = UUID.randomUUID();

        createHallRequest = new CreateHallRequest(
                "Jananeta Abdul Mannan Hall",
                "JAMH",
                GenderType.MALE,
                "01700000000",
                "01800000000",
                null
        );

        hallResponse = new HallResponse(
                hallId,
                "Jananeta Abdul Mannan Hall",
                "JAMH",
                GenderType.MALE,
                "01700000000",
                "01800000000",
                null,
                true,
                null,
                null
        );
    }

    @Test
    @DisplayName("POST /api/v1/halls : 201 CREATED")
    void shouldCreateHallSuccessfully() throws Exception {

        // GIVEN
        Mockito.when(hallService.createHall(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.any(CreateHallRequest.class))).thenReturn(hallResponse);

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/halls")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createHallRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(hallId.toString()))
                .andExpect(jsonPath("$.shortName").value("JAMH"))
                .andExpect(jsonPath("$.fullName").value("Jananeta Abdul Mannan Hall"));

        // VERIFY
        Mockito.verify(hallService).createHall(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.any(CreateHallRequest.class));
    }

    @Test
    @DisplayName("PUT /api/v1/halls/{id} : 200 OK")
    void shouldUpdateHallSuccessfully() throws Exception {

        // GIVEN
        HallResponse updated = new HallResponse(
                hallId, "Updated Hall Name", "UPDT", GenderType.MALE,
                "01700000001", null, null, true, null, null
        );
        Mockito.when(hallService.updateHall(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(hallId), Mockito.any(CreateHallRequest.class)))
                .thenReturn(updated);

        // WHEN & THEN
        mockMvc.perform(put("/api/v1/halls/{id}", hallId)
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createHallRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Hall Name"))
                .andExpect(jsonPath("$.shortName").value("UPDT"));

        // VERIFY
        Mockito.verify(hallService).updateHall(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(hallId), Mockito.any(CreateHallRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/halls : 200 OK")
    void shouldReturnAllHalls() throws Exception {

        // GIVEN
        Mockito.when(hallService.getAllHalls(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(false)))
                .thenReturn(asList(hallResponse));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/halls")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(hallId.toString()))
                .andExpect(jsonPath("$[0].shortName").value("JAMH"));

        // VERIFY
        Mockito.verify(hallService).getAllHalls(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(false));
    }

    @Test
    @DisplayName("GET /api/v1/halls?activeOnly=true : 200 OK")
    void shouldReturnActiveHallsOnly() throws Exception {

        // GIVEN
        Mockito.when(hallService.getAllHalls(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(true))).thenReturn(asList(hallResponse));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/halls").param("activeOnly", "true")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));

        // VERIFY
        Mockito.verify(hallService).getAllHalls(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(true));
    }

    @Test
    @DisplayName("GET /api/v1/halls/{id} : 200 OK")
    void shouldReturnHallById() throws Exception {

        // GIVEN
        Mockito.when(hallService.getHallById(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(hallId))).thenReturn(hallResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/halls/{id}", hallId)
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(hallId.toString()))
                .andExpect(jsonPath("$.shortName").value("JAMH"));

        // VERIFY
        Mockito.verify(hallService).getHallById(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(hallId));
    }

    @Test
    @DisplayName("GET /api/v1/halls/count : 200 OK")
    void shouldReturnHallCount() throws Exception {

        // GIVEN
        Mockito.when(hallService.countHalls(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN))).thenReturn(5L);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/halls/count")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", "SUPER_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(5));

        // VERIFY
        Mockito.verify(hallService).countHalls(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN));
    }

    @Test
    @DisplayName("GET /api/v1/halls/short-name/{shortName} : 200 OK")
    void shouldReturnHallByShortName() throws Exception {

        // GIVEN
        Mockito.when(hallService.getHallByShortName(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq("JAMH"))).thenReturn(hallResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/halls/short-name/{shortName}", "JAMH")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shortName").value("JAMH"));

        // VERIFY
        Mockito.verify(hallService).getHallByShortName(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq("JAMH"));
    }

    @Test
    @DisplayName("PATCH /api/v1/halls/{id}/status : 204 NO CONTENT")
    void shouldUpdateHallStatus() throws Exception {

        // WHEN & THEN
        mockMvc.perform(patch("/api/v1/halls/{id}/status", hallId)
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isNoContent());

        // VERIFY
        Mockito.verify(hallService).updateHallStatus(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(hallId));
    }
}
