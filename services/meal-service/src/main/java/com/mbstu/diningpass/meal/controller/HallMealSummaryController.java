package com.mbstu.diningpass.meal.controller;

import com.mbstu.diningpass.meal.dto.response.summary.HallMealSummaryResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/summary")
public class HallMealSummaryController {

    private final Logger logger= LoggerFactory.getLogger(HallMealSummaryController.class);
    private final HallMealSummaryService hallMealSummaryService;


    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Meal-Service: HallMealSummary Controller is working!");
    }


    @GetMapping(path = {"", "/hall"})
    public ResponseEntity<Page<HallMealSummaryResponse>> getHallSummaries(
            @RequestHeader("X-User-Id") UUID requesterId,
            @RequestHeader("X-User-Role") Role requesterRole,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<HallMealSummaryResponse> response = hallMealSummaryService.getAllHallMealSummary(requesterId, requesterRole, page, size);
        logger.info("[GET_ALL_HALL_SUMMARY] requester={} role={}", requesterId, requesterRole);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
