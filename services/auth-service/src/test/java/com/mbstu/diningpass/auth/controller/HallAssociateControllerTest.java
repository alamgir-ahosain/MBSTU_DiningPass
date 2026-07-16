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
import com.mbstu.diningpass.auth.dto.request.hallassociate.HallAssociateRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.hallassociate.UpdateHallAssociateProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateAdminResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateProfileResponse;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.service.abstraction.HallAssociateService;

@WebMvcTest(HallAssociateController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class HallAssociateControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean HallAssociateService hallAssociateService;

    private UUID superAdminId;
    private UUID hallAdminId;
    private UUID targetId;
    private HallAssociateRegistrationRequest registrationRequest;
    private HallAssociateAdminResponse adminResponse;
    private HallAssociateProfileResponse profileResponse;

    @BeforeEach
    void init() {
        superAdminId = UUID.randomUUID();
        hallAdminId = UUID.randomUUID();
        targetId = UUID.randomUUID();

        registrationRequest = new HallAssociateRegistrationRequest(
                "Staff1 JAMH",
                "staff1.jamh@gmail.com",
                "password1",
                "01700000000",
                Role.HALL_STAFF,
                "JAMH"
        );

        adminResponse = new HallAssociateAdminResponse(
                targetId,
                "Staff1 JAMH",
                "staff1.jamh@gmail.com",
                "01700000000",
                Role.HALL_STAFF,
                "JAMH",
                true,
                null,
                null
        );

        profileResponse = new HallAssociateProfileResponse(
                "JAMH Hall Provost",
                "provost.jamh@gmail.com",
                "01700000001",
                Role.HALL_ADMIN,
                "JAMH",
                true,
                null,
                null
        );
    }

    @Test
    @DisplayName("POST /api/v1/admins : 201 CREATED")
    void shouldCreateAccountSuccessfully() throws Exception {

        // GIVEN
        Mockito.when(hallAssociateService.create(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.any(HallAssociateRegistrationRequest.class))).thenReturn(adminResponse);

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/admins")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(targetId.toString()))
                .andExpect(jsonPath("$.email").value("staff1.jamh@gmail.com"))
                .andExpect(jsonPath("$.role").value("HALL_STAFF"));

        // VERIFY
        Mockito.verify(hallAssociateService).create(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.any(HallAssociateRegistrationRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/admins : 200 OK")
    void shouldReturnAllAccounts() throws Exception {

        // GIVEN
        Mockito.when(hallAssociateService.getAccounts(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.isNull(), Mockito.isNull())).thenReturn(asList(adminResponse));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/admins")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(targetId.toString()))
                .andExpect(jsonPath("$[0].email").value("staff1.jamh@gmail.com"));

        // VERIFY
        Mockito.verify(hallAssociateService).getAccounts(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.isNull(), Mockito.isNull());
    }

    @Test
    @DisplayName("GET /api/v1/admins/me : 200 OK")
    void shouldReturnMyProfile() throws Exception {

        // GIVEN
        Mockito.when(hallAssociateService.getMyProfile(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN))).thenReturn(profileResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/admins/me")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("JAMH Hall Provost"))
                .andExpect(jsonPath("$.email").value("provost.jamh@gmail.com"));

        // VERIFY
        Mockito.verify(hallAssociateService).getMyProfile(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN));
    }

    @Test
    @DisplayName("GET /api/v1/admins/{id} : 200 OK")
    void shouldReturnAccountById() throws Exception {

        // GIVEN
        Mockito.when(hallAssociateService.getById(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(targetId))).thenReturn(adminResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/admins/{id}", targetId)
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", Role.SUPER_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(targetId.toString()));

        // VERIFY
        Mockito.verify(hallAssociateService).getById(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN), Mockito.eq(targetId));
    }

    @Test
    @DisplayName("PUT /api/v1/admins/me : 200 OK")
    void shouldUpdateMyProfileSuccessfully() throws Exception {

        // GIVEN
        UpdateHallAssociateProfileRequest updateRequest = new UpdateHallAssociateProfileRequest("Updated Name", "01911111111");
        HallAssociateProfileResponse updated = new HallAssociateProfileResponse(
                "Updated Name", "provost.jamh@gmail.com", "01911111111", Role.HALL_ADMIN, "JAMH", true, null, null
        );

        Mockito.when(hallAssociateService.updateMyProfile(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.any(UpdateHallAssociateProfileRequest.class))).thenReturn(updated);

        // WHEN & THEN
        mockMvc.perform(put("/api/v1/admins/me")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.phone").value("01911111111"));

        // VERIFY
        Mockito.verify(hallAssociateService).updateMyProfile(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.any(UpdateHallAssociateProfileRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/admins/count : 200 OK")
    void shouldReturnAccountCounts() throws Exception {

        // GIVEN
        Mockito.when(hallAssociateService.countAccounts(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN)))
                .thenReturn(java.util.Map.of("active_hall_admins", 3L, "active_hall_staff", 10L));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/admins/count")
                        .header("X-User-Id", superAdminId.toString())
                        .header("X-User-Role", "SUPER_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active_hall_admins").value(3))
                .andExpect(jsonPath("$.active_hall_staff").value(10));

        // VERIFY
        Mockito.verify(hallAssociateService).countAccounts(Mockito.eq(superAdminId), Mockito.eq(Role.SUPER_ADMIN));
    }

    @Test
    @DisplayName("PATCH /api/v1/admins/{id}/status : 200 OK")
    void shouldSuspendAccountSuccessfully() throws Exception {

        // GIVEN
        MessageResponse messageResponse = new MessageResponse("HALL_STAFF suspended successfully", true);

        Mockito.when(hallAssociateService.updateStatus(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(targetId))).thenReturn(messageResponse);

        // WHEN & THEN
        mockMvc.perform(patch("/api/v1/admins/{id}/status", targetId)
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("HALL_STAFF suspended successfully"))
                .andExpect(jsonPath("$.success").value(true));

        // VERIFY
        Mockito.verify(hallAssociateService).updateStatus(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(targetId));
    }
}