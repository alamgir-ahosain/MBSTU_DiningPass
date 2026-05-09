package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.dto.request.mealtoken.CutTokenRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
import com.mbstu.diningpass.meal.dto.response.mealtoken.CutTokenResponse;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.entity.Payment;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.PaymentStatus;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.exception.BadRequestException;
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

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

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

            if (LocalTime.now().isAfter(mealConfig.getCutTokenBefore())) {
                throw new BadRequestException("Booking window for " + mealType + " has closed. Deadline was " + mealConfig.getCutTokenBefore());
            }
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







}