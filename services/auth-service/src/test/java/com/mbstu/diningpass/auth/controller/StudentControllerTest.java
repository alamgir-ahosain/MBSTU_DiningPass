package com.mbstu.diningpass.auth.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileAdminResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileResponse;
import com.mbstu.diningpass.auth.enums.GenderType;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.service.abstraction.StudentService;

@WebMvcTest(StudentController.class)
@Import({NoRedisConfig.class, SecurityConfig.class})
public class StudentControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();   // manually instantiated

    @MockitoBean StudentService studentService;

    private UUID studentId;
    private StudentRegistrationRequest registrationRequest;
    private StudentProfileResponse profileResponse;

    @BeforeEach
    void init() {
        studentId = UUID.randomUUID();

        registrationRequest = new StudentRegistrationRequest(
                "CE21012",
                "Alamgir Hosain",
                "ce21012@mbstu.ac.bd",
                "password1",
                "JAMH",
                "112",
                "CSE",
                GenderType.MALE
        );

        profileResponse = new StudentProfileResponse(
                "CE21012",
                "Alamgir Hosain",
                "ce21012@mbstu.ac.bd",
                Role.STUDENT,
                "JAMH",
                "112",
                "CSE",
                GenderType.MALE,
                true,
                null,
                null
        );
    }

    @Test
    @DisplayName("GET /api/v1/students/test : 200 OK")
    void shouldReturnTestMessage() throws Exception {

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/students/test")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/v1/students : 201 CREATED")
    void shouldRegisterStudentSuccessfully() throws Exception {

        // GIVEN
        Mockito.when(studentService.register(Mockito.any(StudentRegistrationRequest.class))).thenReturn(profileResponse);

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value("CE21012"))
                .andExpect(jsonPath("$.fullName").value("Alamgir Hosain"))
                .andExpect(jsonPath("$.hallShortName").value("JAMH"));

        // VERIFY
        Mockito.verify(studentService).register(Mockito.any(StudentRegistrationRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/students/me : 200 OK")
    void shouldReturnMyProfile() throws Exception {

        // GIVEN
        Mockito.when(studentService.getMyProfile(Mockito.eq(studentId), Mockito.eq(Role.STUDENT))).thenReturn(profileResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/students/me")
                        .header("X-User-Id", studentId.toString())
                        .header("X-User-Role", Role.STUDENT.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value("CE21012"))
                .andExpect(jsonPath("$.email").value("ce21012@mbstu.ac.bd"));

        // VERIFY
        Mockito.verify(studentService).getMyProfile(Mockito.eq(studentId), Mockito.eq(Role.STUDENT));
    }

    @Test
    @DisplayName("PUT /api/v1/students/me : 200 OK")
    void shouldUpdateMyProfileSuccessfully() throws Exception {

        // GIVEN
        UpdateStudentProfileRequest updateRequest = new UpdateStudentProfileRequest("Jane Doe", "202");
        StudentProfileResponse updated = new StudentProfileResponse(
                "CE21012", "Jane Doe", "ce21012@mbstu.ac.bd", Role.STUDENT,
                "JAMH", "202", "CSE", GenderType.MALE, true, null, null
        );

        Mockito.when(studentService.updateMyProfile(Mockito.eq(studentId), Mockito.eq(Role.STUDENT), Mockito.any(UpdateStudentProfileRequest.class)))
                .thenReturn(updated);

        // WHEN & THEN
        mockMvc.perform(put("/api/v1/students/me")
                        .header("X-User-Id", studentId.toString())
                        .header("X-User-Role", Role.STUDENT.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Jane Doe"))
                .andExpect(jsonPath("$.roomNumber").value("202"));

        // VERIFY
        Mockito.verify(studentService).updateMyProfile(Mockito.eq(studentId), Mockito.eq(Role.STUDENT), Mockito.any(UpdateStudentProfileRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/students : 200 OK")
    void shouldReturnAllStudents() throws Exception {

        // GIVEN
        UUID hallAdminId = UUID.randomUUID();
        StudentProfileAdminResponse adminResponse = new StudentProfileAdminResponse(
                studentId, "CE21012", "Alamgir Hosain", "ce21012@mbstu.ac.bd", "JAMH", "112", "CSE", true
        );
        Pageable pageable = PageRequest.of(0, 20);
        Page<StudentProfileAdminResponse> page = new PageImpl<>(List.of(adminResponse), pageable, 1);

        Mockito.when(studentService.getAllStudents(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.isNull(), Mockito.eq(0), Mockito.eq(20)))
                .thenReturn(page);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/students")
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.size()").value(1))
                .andExpect(jsonPath("$.content[0].studentId").value("CE21012"))
                .andExpect(jsonPath("$.totalElements").value(1));

        // VERIFY
        Mockito.verify(studentService).getAllStudents(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.isNull(), Mockito.eq(0), Mockito.eq(20));
    }

    @Test
    @DisplayName("PATCH /api/v1/students/{id}/status : 200 OK")
    void shouldSuspendStudentSuccessfully() throws Exception {

        // GIVEN
        UUID hallAdminId = UUID.randomUUID();
        MessageResponse messageResponse = new MessageResponse("STUDENT suspended successfully", true);
        Mockito.when(studentService.suspendStudent(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(studentId))).thenReturn(messageResponse);

        // WHEN & THEN
        mockMvc.perform(patch("/api/v1/students/{id}/status", studentId)
                        .header("X-User-Id", hallAdminId.toString())
                        .header("X-User-Role", Role.HALL_ADMIN.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("STUDENT suspended successfully"))
                .andExpect(jsonPath("$.success").value(true));

        // VERIFY
        Mockito.verify(studentService).suspendStudent(Mockito.eq(hallAdminId), Mockito.eq(Role.HALL_ADMIN), Mockito.eq(studentId));
    }
}
