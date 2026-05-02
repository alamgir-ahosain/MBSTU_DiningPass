package com.mbstu.diningpass.auth.controller;



import com.mbstu.diningpass.auth.dto.request.admin.CreateAdminRequest;
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
       Create a new Admin or Staff account.
        Access: SUPER_ADMIN
     */
    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        logger.info("Super Admin creating new {} account: {}", request.role(), request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAdminRequest(request));
    }

    /**
       List all administrator accounts (active and inactive).
       Access: SUPER_ADMIN
     */
    @GetMapping
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        logger.info("Fetching all admin accounts");
        return ResponseEntity.ok(adminService.getAllAdmin());
    }

    /**
       Soft delete/Deactivate an admin account.
       Access: SUPER_ADMIN
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateAdmin(@PathVariable UUID id) {
        logger.warn("Request to deactivate Admin account ID: {}", id);
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }

}
