package com.mbstu.diningpass.meal.controller;

import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.mealtoken.MealTokenStudentResponse;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.service.abstraction.MealTokenService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meal-tokens")
@AllArgsConstructor
public class MealTokenController {

    private final MealTokenService mealTokenService;
    private final Logger logger= LoggerFactory.getLogger(MealTokenController.class);


    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Meal-Service: Meal Token Controller is working!");
    }
//
//    // STUDENT cuts (books) a token — submits payment info
//    @PostMapping
//    public ResponseEntity<CutTokenResponse> cutToken(
//            @RequestHeader("X-User-Id")   UUID studentId,
//            @RequestHeader("X-User-Role") Role role,
//            @Valid @RequestBody CutTokenRequest request) {
//
//        CutTokenResponse response = mealTokenService.cutToken(studentId, role, request);
//        logger.info("[CUT_TOKEN] studentId={} role={} mealDate={} mealTypes={}", studentId, role, request.mealDate(), request.mealTypes());
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }


    // GET /api/v1/meal-tokens/my
    // Student views their own approved tokens
    @GetMapping("/my")
    public ResponseEntity<List<MealTokenStudentResponse>> getMyMealTokens(
            @RequestHeader("X-User-Id")   UUID studentId,
            @RequestHeader("X-User-Role") Role role) {
        List<MealTokenStudentResponse> response = mealTokenService.getMyMealToken(studentId, role);
        logger.info("[GET_MY_MEAL_TOKENS] studentId={} role={}", studentId, role);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


}