package com.mbstu.diningpass.auth.controller;

import com.mbstu.diningpass.auth.dto.request.admin.CreateAdminRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.admin.AdminResponse;
import com.mbstu.diningpass.auth.service.abstraction.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    /**
      Create Admin
     Access: SUPER_ADMIN (validated at gateway via Firebase claims)
     */
    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(
            @RequestHeader("X-User-Id") UUID superAdminId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody CreateAdminRequest request) {

        logger.info("Super Admin {} creating admin: {}", superAdminId, request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAdmin(request));
    }




    /**
      Get all admins
     */
    @GetMapping
    public ResponseEntity<List<AdminResponse>> getAllAdmins(
            @RequestHeader("X-User-Role") String role) {

        logger.info("Fetching all admin accounts");
        return ResponseEntity.ok(adminService.getAllAdmin());
    }


    /**
      Soft delete (suspend) admin
     */
    @PutMapping("/{id}/suspend")
    public ResponseEntity<MessageResponse> suspendAdmin(
            @RequestHeader("X-User-Id") UUID superAdminId,
            @PathVariable UUID id,
            @Valid @RequestBody SuspendStudentRequest request) {

        logger.warn("Super Admin {} suspending admin ID: {}", superAdminId, id);
        return ResponseEntity.ok(adminService.deleteAdmin(id, request));
    }
}