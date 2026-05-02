package com.mbstu.diningpass.auth.controller;

import com.mbstu.diningpass.auth.dto.request.hall.CreateHallRequest;
import com.mbstu.diningpass.auth.dto.response.hall.HallResponse;
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

    // 1. Create a Hall
    @PostMapping
    public ResponseEntity<HallResponse> createHall(@Valid @RequestBody CreateHallRequest request) {
        logger.info("Admin creating new hall: {}", request.shortName());
        return ResponseEntity.status(HttpStatus.CREATED).body(hallService.createHall(request));
    }

    // 2. Update Hall (Supports re-activation if already inactive)
    @PutMapping("/{id}")
    public ResponseEntity<HallResponse> updateHall(@PathVariable UUID id, @Valid @RequestBody CreateHallRequest request) {
        logger.info("Updating hall details for ID: {}", id);
        return ResponseEntity.ok(hallService.updateHall(id, request));
    }

    // 3. Get All Halls (with optional filtering)
    @GetMapping
    public ResponseEntity<List<HallResponse>> getAllHalls(@RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        if (activeOnly) {return ResponseEntity.ok(hallService.getAllActiveHall());}
        return ResponseEntity.ok(hallService.getAllHall());
    }

    // 4. Get Hall By ID
    @GetMapping("/{id}")
    public ResponseEntity<HallResponse> getHallById(@PathVariable UUID id) {
        return ResponseEntity.ok(hallService.getHallById(id));
    }

    // 5. Get Hall By Short Name
    @GetMapping("/short-name/{shortName}")
    public ResponseEntity<HallResponse> getHallByShortName(@PathVariable String shortName) {
        return ResponseEntity.ok(hallService.getHallByShortName(shortName));
    }

    // 6. Soft Delete (Deactivate)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHall(@PathVariable UUID id) {
        logger.warn("Soft-deletion (deactivation) requested for hall ID: {}", id);
        hallService.deleteHall(id);
        return ResponseEntity.noContent().build();
    }

}
