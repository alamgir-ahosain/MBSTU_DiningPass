package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
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
import com.mbstu.diningpass.meal.service.abstraction.MealTokenService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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




    @Override
    @Transactional
    public CutTokenResponse cutToken(UUID studentId, Role role, CutTokenRequest request) {

        StudentProfileResponse profileResponse= studentFeignClient.getProfile();

        Long totalAmount = 0L;

        // check duplicate requests
        for (MealType mealType : request.mealTypes()) {

            MealConfig mealConfig = mealConfigRepository.
                    findByHallShortNameAndMealDateAndMealType(
                            profileResponse.hallShortName(),
                            request.mealDate(),
                            mealType
                    )
                    .orElseThrow(() -> new ResourceNotFoundException("Meal config not found"));

//            if (LocalTime.now().isAfter(mealConfig.getCutTokenBefore())) {
//                throw new BadRequestException("Booking window for " + mealType + " has closed. Deadline was " + mealConfig.getCutTokenBefore());
//            }

            // Check booking is open
            validateBookingOpen(mealConfig, mealType);
            totalAmount += mealConfig.getMealPrice();

            boolean pendingExists =
                    paymentRepository.existsMealRequest(
                            studentId,
                            mealConfig.getMealDate(),
                            mealType,
                            List.of(
                                    PaymentStatus.SUBMITTED,
                                    PaymentStatus.VERIFIED
                            )
                    );

            boolean approvedTokenExists =
                    mealTokenRepository
                            .existsByStudentIdAndMealDateAndMealType(
                                    studentId,
                                    mealConfig.getMealDate(),
                                    mealType
                            );

            if (pendingExists ) {
                throw new BadRequestException("You have already submitted a request for this meal");
            }
            if (approvedTokenExists) {
                throw new BadRequestException("You have already completed payment for this meal");
            }
        }

        Payment payment = Payment.builder()
                .studentId(studentId)
                .hallShortName(profileResponse.hallShortName())
                .mealDate(request.mealDate())
                .mealTypes(request.mealTypes())
                .paymentMethod(request.paymentMethod())
                .senderNumber(request.senderNumber())
                .totalAmount(totalAmount)
                .screenshotUrl(request.screenshotUrl())
                .paymentStatus(PaymentStatus.SUBMITTED)
                .build();

        paymentRepository.save(payment);
        return new CutTokenResponse(
                payment.getPaymentStatus(),
                payment.getSubmittedAt()
        );
    }





    @Override
    public List<MealTokenStudentResponse> getMyMealToken(UUID studentId, Role role) {

        if (role != Role.STUDENT) {
            throw new ForbiddenException("Only students can access their meal tokens");
        }

        List<MealToken> tokens = mealTokenRepository
                .findByStudentIdAndTokenStatus(studentId, TokenStatus.APPROVED);

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

            return new MealTokenStudentResponse(
                    token.getId(),              // ← id included now
                    token.getHallShortName(),
                    token.getMealDate(),
                    token.getMealType(),
                    token.getMealPrice(),
                    menu,
                    token.getTokenStatus(),
                    token.getQrCodeData(),
                    token.getQrGeneratedAt(),
                    token.getScanMode(),
                    token.getUsedAt()
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

