package com.mbstu.diningpass.auth.controller;


import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.request.student.StudentRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.UpdateStudentProfileRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.dto.response.student.StudentResponse;
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



    @PostMapping("/register")
    public ResponseEntity<StudentResponse> register(
            @Valid @RequestBody StudentRegistrationRequest req) {
        logger.info("Student registering: {}", req.studentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.register(req));
    }


    @GetMapping("/profile")
    public ResponseEntity<StudentResponse> getProfile(@RequestHeader("X-User-Id") UUID userId) {
        logger.info("Fetching student profile for user ID: {}", userId);
        return ResponseEntity.ok(studentService.getStudentById(userId));
    }




    @PutMapping("/profile")
    public ResponseEntity<StudentResponse> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateStudentProfileRequest req) {
        logger.info("Updating student profile for user ID: {}", userId);
        return ResponseEntity.ok(studentService.updateStudent(userId, req));
    }



}
