package com.mbstu.diningpass.meal.controller;

import com.mbstu.diningpass.meal.dto.request.qr.StaffScanRequest;
import com.mbstu.diningpass.meal.dto.response.qr.QrScanResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.QrScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meal-tokens")
@RequiredArgsConstructor
public class QrScanController {

    private  static final Logger logger = LoggerFactory.getLogger(QrScanController.class);
    private final QrScanService qrScanService;

    // Mode 1 - Counter staff scans student's QR
    @PostMapping("/staff-scan")
    public ResponseEntity<QrScanResponse> staffScan(
            @RequestHeader("X-User-Id") UUID id,
            @RequestHeader("X-User-Role") Role role,
            @RequestBody @Valid StaffScanRequest request) {

        QrScanResponse response = qrScanService.staffScan(id, role, request);
        logger.info("[STAFF_SCAN] Token" );
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


   // Mode 2 - Student scans hall counter QR
}