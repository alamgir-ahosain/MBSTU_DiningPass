package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.dto.response.mealtoken.MealTokenStudentResponse;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.exception.BadRequestException;
import com.mbstu.diningpass.meal.exception.ForbiddenException;
import com.mbstu.diningpass.meal.exception.ResourceNotFoundException;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.service.abstraction.MealTokenService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MealTokenServiceImpl implements MealTokenService {

    private  static final Logger logger = LoggerFactory.getLogger(MealTokenServiceImpl.class);
    private final PaymentRepository paymentRepository;
    private final MealTokenRepository mealTokenRepository;
    private  final MealConfigRepository mealConfigRepository;
    private final StudentFeignClient studentFeignClient;
    private  final HallMealSummaryService hallMealSummaryService;





    // Cut token — evict student's token list since a new payment is submitted
//    @Override
//    @Transactional
//    @CacheEvict(value = "mealTokens", key = "'student:' + #studentId")
//    public CutTokenResponse cutToken(UUID studentId, Role role, CutTokenRequest request) {
//
//        logger.warn("meal-service/mealToken: DIRECT DB CALL for cutToken");
//
//        StudentProfileResponse profileResponse= studentFeignClient.getProfile();
//
//        Long totalAmount = 0L;
//        List<UUID> rejectedPaymentIdsToDelete = new ArrayList<>();
//
//
//        // check duplicate requests
//        for (MealType mealType : request.mealTypes()) {
//
//            MealConfig mealConfig = mealConfigRepository.
//                    findByHallShortNameAndMealDateAndMealType(
//                            profileResponse.hallShortName(),
//                            request.mealDate(),
//                            mealType
//                    )
//                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found"));
//
////            if (LocalTime.now().isAfter(mealConfig.getCutTokenBefore())) {
////                throw new BadRequestException("Booking window for " + mealType + " has closed. Deadline was " + mealConfig.getCutTokenBefore());
////            }
//
//            // Check booking is open
//            validateBookingOpen(mealConfig, mealType);
//            totalAmount += mealConfig.getMealPrice();
//
//            boolean pendingExists =
//                    paymentRepository.existsMealRequest(
//                            studentId,
//                            mealConfig.getMealDate(),
//                            mealType,
//                            List.of(
//                                    PaymentStatus.SUBMITTED,
//                                    PaymentStatus.VERIFIED
//                            )
//                    );
//
//            boolean approvedTokenExists =
//                    mealTokenRepository
//                            .existsByStudentIdAndMealDateAndMealType(
//                                    studentId,
//                                    mealConfig.getMealDate(),
//                                    mealType
//                            );
//
//            if (pendingExists ) {
//                throw new BadRequestException("You have already submitted a request for " +mealType);
//            }
//            if (approvedTokenExists) {
//                throw new BadRequestException("You have already completed payment for this meal");
//            }
//            // Collect rejected payments for this meal type to delete before resubmission
//            paymentRepository.findRejectedPayment(studentId, mealConfig.getMealDate(), mealType, PaymentStatus.REJECTED)
//                    .ifPresent(rejected -> {
//                        rejectedPaymentIdsToDelete.add(rejected.getId());
//                        logger.info("Rejected payment found and queued for deletion, paymentId={}, studentId={}", rejected.getId(), studentId);
//                    });
//        }
//
//
//
//
//
//        // Delete all rejected payments before saving the new one
//        if (!rejectedPaymentIdsToDelete.isEmpty()) {
//            paymentRepository.deleteAllById(rejectedPaymentIdsToDelete);
//            logger.info("Deleted {} rejected payment(s) for studentId={}",
//                    rejectedPaymentIdsToDelete.size(), studentId);
//        }
//
//        Payment payment = Payment.builder()
//                .studentId(studentId)
//                .hallShortName(profileResponse.hallShortName())
//                .mealDate(request.mealDate())
//                .mealTypes(request.mealTypes())
//                .paymentMethod(request.paymentMethod())
//                .senderNumber(request.senderNumber())
//                .totalAmount(totalAmount)
//                .screenshotUrl(request.screenshotUrl())
//                .paymentStatus(PaymentStatus.SUBMITTED)
//                .build();
//
//        paymentRepository.save(payment);
//        return new CutTokenResponse(
//                payment.getPaymentStatus(),
//                payment.getSubmittedAt()
//        );
//    }
//




    // Get own tokens — cache per studentId, only APPROVED tokens
    @Override
    @Cacheable(value = "mealTokens", key = "'student:' + #studentId")
    public List<MealTokenStudentResponse> getMyMealToken(UUID studentId, Role role) {

        logger.warn("meal-service/mealToken: DIRECT DB CALL for getMyMealToken");

        if (role != Role.STUDENT) {
            throw new ForbiddenException("Only students can access their meal tokens");
        }

        List<MealToken> tokens = mealTokenRepository.findByStudentIdAndTokenStatus(studentId, TokenStatus.APPROVED);

        if (tokens.isEmpty()) {
            return List.of();   // empty list, not an exception
        }

        // Collect all (hallShortName, mealDate, mealType) combos needed
        // then fetch configs in ONE query
        List<LocalDate> dates = tokens.stream()
                .map(MealToken::getMealDate)
                .distinct().toList();

        String hallShortName = tokens.get(0).getHallShortName(); // all same hall

        // One DB call for all configs needed
        Map<String, MealConfig> configMap = mealConfigRepository
                .findByHallShortNameAndMealDateIn(hallShortName, dates)
                .stream()
                .collect(Collectors.toMap(
                        c -> c.getMealDate() + "_" + c.getMealType(),
                        c -> c
                ));

        return tokens.stream().map(token -> {
            String key = token.getMealDate() + "_" + token.getMealType();
            MealConfig config = configMap.get(key);
            String menu = config != null ? config.getMealMenu() : null;
            assert config != null;
            LocalTime tokenExpiry= config.getTokenExpires();

            // Format LocalTime to readable string with AM/PM format
            String formattedTokenExpiry = tokenExpiry != null
                ? tokenExpiry.format(DateTimeFormatter.ofPattern("hh:mm a"))
                : null;

            return new MealTokenStudentResponse(
                    token.getId(),              // ← id included now
                    token.getMealDate(),
                    token.getMealType(),
                    menu,
                    formattedTokenExpiry,       // Now using formatted String instead of LocalTime
                    token.getTokenStatus(),
                    token.getQrCodeData()
            );
        }).toList();
    }

    private void validateBookingOpen(MealConfig mealConfig, MealType mealType) {

        // Check 1: meal config must be active
        if (!mealConfig.isActive()) {
            throw new BadRequestException("Booking for " + mealType + " on " + mealConfig.getMealDate() + " is not available");
        }

        // Check 2: combine mealDate + cutTokenBefore into one LocalDateTime
        LocalDateTime cutoff  = LocalDateTime.of(mealConfig.getMealDate(), mealConfig.getCutTokenBefore());
        LocalDateTime now     = LocalDateTime.now();

        if (!now.isBefore(cutoff)) {
            throw new BadRequestException("Booking window for " + mealType + " has closed. Deadline was " + cutoff);
        }
    }
}

