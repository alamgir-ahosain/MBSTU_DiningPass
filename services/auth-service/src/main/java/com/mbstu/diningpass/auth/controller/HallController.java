package com.mbstu.diningpass.auth.controller;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
import com.mbstu.diningpass.auth.enums.Role;
import com.mbstu.diningpass.auth.service.abstraction.HallService;
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
@RequiredArgsConstructor
@RequestMapping("/api/v1/halls")
public class HallController {

    private final HallService hallService;
    private static final Logger logger = LoggerFactory.getLogger(HallController.class);

    // ==============================
    // CREATE HALL (SUPER ADMIN ONLY)
    // ==============================
    @PostMapping
    public ResponseEntity<HallResponse> createHall(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @Valid @RequestBody CreateHallRequest request) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[CREATE_HALL] requester={} role={}", requesterId, role);

        return ResponseEntity.status(HttpStatus.CREATED).body(hallService.createHall(requesterId, role, request));
    }

    // ==============================
    // UPDATE HALL (SUPER ADMIN ONLY)
    // ==============================
    @PutMapping("/{id}")
    public ResponseEntity<HallResponse> updateHall(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable UUID id,
            @Valid @RequestBody CreateHallRequest request) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[UPDATE_HALL] requester={} role={} hallId={}", requesterId, role, id);

        return ResponseEntity.ok(hallService.updateHall(requesterId, role, id, request));
    }

    // ==============================
    // GET ALL HALLS (SUPER ADMIN ONLY)
    // ==============================
    @GetMapping
    public ResponseEntity<List<HallResponse>> getAllHalls(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[GET_ALL_HALLS] requester={} role={}", requesterId, role);

        return ResponseEntity.ok(hallService.getAllHalls(requesterId, role, activeOnly));
    }

    // ==============================
    // GET BY ID
    // ==============================
    @GetMapping("/{id}")
    public ResponseEntity<HallResponse> getHallById(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable UUID id) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[GET_HALL_BY_ID] requester={} role={} target={}", requesterId, role, id);

        return ResponseEntity.ok(hallService.getHallById(requesterId, role, id));
    }

    // Count All Hall
    @GetMapping("/count")
    public ResponseEntity<Long> countHalls(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-User-Role") Role role) {

        logger.info("[COUNT_HALLS] user={} role={}", userId, role);
        return ResponseEntity.ok(hallService.countHalls(userId, role));
    }


    // ==============================
    // GET BY SHORT NAME
    // ==============================
    @GetMapping("/short-name/{shortName}")
    public ResponseEntity<HallResponse> getHallByShortName(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable String shortName) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[GET_HALL_BY_SHORT] requester={} role={} shortName={}", requesterId, role, shortName);

        return ResponseEntity.ok(hallService.getHallByShortName(requesterId, role, shortName));
    }

    // ==============================
    // SUSPEND HALL (SUPER ADMIN ONLY)
    // ==============================
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateHallStatus(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") String requesterRoleStr,
            @PathVariable UUID id) {

        Role role = Role.valueOf(requesterRoleStr);
        logger.info("[SUSPEND_HALL] requester={} role={} hallId={}", requesterId, role, id);

        hallService.updateHallStatus(requesterId, role, id);
        return ResponseEntity.noContent().build();

    }


}