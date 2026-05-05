package com.mbstu.diningpass.auth.controller;

import com.mbstu.diningpass.auth.dto.request.hallassociate.HallAssociateRegistrationRequest;
import com.mbstu.diningpass.auth.dto.request.student.SuspendStudentRequest;
import com.mbstu.diningpass.auth.dto.response.MessageResponse;
import com.mbstu.diningpass.auth.dto.response.hallassociate.HallAssociateResponse;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.service.abstraction.HallAssociateService;
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
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
public class HallAssociateController {

    private final HallAssociateService hallAssociateService;
    private static final Logger logger = LoggerFactory.getLogger(HallAssociateController.class);


    // ==============================
    // CREATE ACCOUNT
    // ==============================

    @PostMapping
    public ResponseEntity<HallAssociateResponse> createAccount(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @Valid @RequestBody HallAssociateRegistrationRequest request) {

        Role requesterRole = Role.valueOf(requesterRoleStr);
        logger.info("User {} ({}) creating Hall Admin: {}", requesterId, requesterRole, request.email());

        HallAssociateResponse response =hallAssociateService.create(requesterId, requesterRole, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }





    // ==============================
    // GET ACCOUNTS (FILTER + ALL)
    // ==============================

    @GetMapping
    public ResponseEntity<List<HallAssociateResponse>> getAllAccount(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UUID hallId) {

        Role requesterRole = Role.valueOf(requesterRoleStr);
        logger.info("[GET_ACCOUNTS] requester={} role={} filterRole={} hallId={}", requesterId, requesterRole, role, hallId);

        return ResponseEntity.ok(hallAssociateService.getAccounts(requesterId, requesterRole, role, hallId));
    }




    // ==============================
    // GET BY ID
    // ==============================

    @GetMapping("/{id}")
    public ResponseEntity<HallAssociateResponse> getById(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable UUID id) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[GET_BY_ID] requester={} role={} target={}", requesterId, role, id);

        return ResponseEntity.ok(hallAssociateService.getById(requesterId, role, id));
    }




    // ==============================
    // SUSPEND ACCOUNT: soft delete
    // ==============================

    @PatchMapping("/{id}/status")
    public ResponseEntity<MessageResponse> suspendAccount(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable UUID id,
            @Valid @RequestBody SuspendStudentRequest request) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.warn("[SUSPEND_REQUEST] requester={} role={} target={}", requesterId, role, id);

        return ResponseEntity.ok(hallAssociateService.suspend(requesterId, role, id, request));
    }


}