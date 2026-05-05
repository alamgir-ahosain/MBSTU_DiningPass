package com.mbstu.diningpass.auth.controller;


import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileAdminResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentProfileResponse;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.service.abstraction.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor

public class StudentController {

    private final StudentService studentService;
    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(StudentController.class);


    // ==============================
    // Register Student
    // ==============================

    @PostMapping
    public ResponseEntity<StudentProfileResponse> register(
            @Valid @RequestBody StudentRegistrationRequest req) {
        logger.info("Student registering: {}", req.studentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.register(req));
    }

    // ==============================
    // GET MY PROFILE
    // ==============================
    @GetMapping("/me")
    public ResponseEntity<StudentProfileResponse> getProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-User-Role") String roleStr) {

        Role role = Role.valueOf(roleStr);
        logger.info("[GET_PROFILE] user={} role={}", userId, role);

        return ResponseEntity.ok(studentService.getMyProfile(userId, role));
    }



    // ==============================
    // UPDATE MY PROFILE
    // ==============================
    @PutMapping("/me")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-User-Role") String roleStr,
            @Valid @RequestBody UpdateStudentProfileRequest req) {

        Role role = Role.valueOf(roleStr);
        logger.info("[UPDATE_PROFILE] user={} role={}", userId, role);

        return ResponseEntity.ok(studentService.updateMyProfile(userId, role, req));
    }


    // ==============================
    // GET ALL  STUDENT
    // ==============================
    @GetMapping
    public ResponseEntity<List<StudentProfileAdminResponse>> getAllStudents(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String roleStr,
            @RequestParam(required = false) UUID hallId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        Role role = Role.valueOf(roleStr);
        logger.info("[GET_ALL_STUDENTS] requester={} role={} hallId={} activeOnly={}", requesterId, role, hallId, activeOnly);
        return ResponseEntity.ok(studentService.getAllStudents(requesterId, role, hallId, activeOnly));
    }

    // ==============================
    // SUSPEND STUDENT
    // ==============================

    @PatchMapping("/{id}/status")
    public ResponseEntity<MessageResponse> suspendStudent(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String roleStr,
            @PathVariable UUID id,
            @Valid @RequestBody SuspendStudentRequest request) {

        Role role = Role.valueOf(roleStr);
        logger.warn("[SUSPEND_STUDENT] requester={} role={} target={}", requesterId, role, id);

        return ResponseEntity.ok(studentService.suspendStudent(requesterId, role, id, request));
    }


}
