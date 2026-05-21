package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.summary.HallMealSummaryResponse;
import com.mbstu.diningpass.meal.entity.HallMealSummary;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.exception.ForbiddenException;
import com.mbstu.diningpass.meal.repository.HallMealSummaryRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import org.springframework.data.domain.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HallMealSummaryServiceImpl implements HallMealSummaryService {

    Logger logger = LoggerFactory.getLogger(HallMealSummaryServiceImpl.class);
    private final HallMealSummaryRepository summaryRepo;
    private final HallAssociateFeignClient hallAssociateFeignClient;



    @Override
    @Transactional
    public void onPaymentApproved(String hallShortName, LocalDate mealDate,
                                  MealType mealType, Long amount,
                                  String mealMenu, String feastNote) {

        HallMealSummary summary = getOrReset(hallShortName, mealType, mealDate, mealMenu, feastNote, amount);
        summary.setTotalTokensSold(summary.getTotalTokensSold() + 1);
        summary.setTotalRevenue(summary.getTotalRevenue() + amount);
        summaryRepo.save(summary);

        logger.debug("Summary updated — payment approved: {} {} sold++ revenue+={}", hallShortName, mealType, amount);
    }


    @Override
    @Transactional
    public void onTokenUsed(String hallShortName, LocalDate mealDate, MealType mealType) {

        HallMealSummary summary = getOrReset(hallShortName, mealType, mealDate, null, null, null);
        summary.setTotalTokensUsed(summary.getTotalTokensUsed() + 1);
        summaryRepo.save(summary);

        logger.debug("Summary updated — token used: {} {}", hallShortName, mealType);
    }


    @Override
    @Transactional
    public void onTokenExpired(String hallShortName, LocalDate mealDate, MealType mealType) {

        HallMealSummary summary = getOrReset(hallShortName, mealType, mealDate, null, null, null);
        summary.setTotalTokensUnused(summary.getTotalTokensUnused() + 1);

        summaryRepo.save(summary);
        logger.debug("Summary updated — token expired: {} {}", hallShortName, mealType);
    }



    @Override
    public Page<HallMealSummaryResponse> getAllHallMealSummary(UUID id, Role requesterRole, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("mealDate").ascending().and(Sort.by("mealType").ascending()));

        if (requesterRole != Role.HALL_ADMIN && requesterRole != Role.HALL_STAFF) {
            throw new ForbiddenException("Only Hall Admins and Hall Staff can view summaries");
        }

        HallAssociateProfileResponse profile = hallAssociateFeignClient.getMyProfile();
        String hallShortName = profile.hallShortName();

        if (hallShortName == null) {
            throw new ForbiddenException("Your account has no hall assigned.");
        }

        Page<HallMealSummary> hallMealSummaryList = summaryRepo.findByHallShortName(hallShortName, pageable);

        return hallMealSummaryList.map(summary -> new HallMealSummaryResponse(
                summary.getId(),
                summary.getHallShortName(),
                summary.getMealDate(),
                summary.getMealType(),
                summary.getMealMenu(),
                summary.getFeastNote(),
                summary.getMealPrice(),
                summary.getTotalTokensSold(),
                summary.getTotalTokensUsed(),
                summary.getTotalTokensUnused(),
                summary.getTotalRevenue(),
                summary.isFinalized(),
                summary.getFinalizedAt(),
                summary.getCreatedAt(),
                summary.getUpdatedAt()
        ));
    }


    // Find existing row — if date changed (new day), reset counters
    // This keeps exactly ONE row per (hall + mealType) forever
    private HallMealSummary getOrReset(String hallShortName, MealType mealType,
                                       LocalDate mealDate, String mealMenu,
                                       String feastNote, Long mealPrice) {

        return summaryRepo.findByHallShortNameAndMealType(hallShortName, mealType)
                .map(existing -> {
                    // Same date — return as-is, keep existing counters
                    if (mealDate.equals(existing.getMealDate())) {
                        return existing;
                    }

                    // New date detected — reset everything for the new day
                    logger.info("New date for {} {} — resetting summary ({} -> {})", hallShortName, mealType, existing.getMealDate(), mealDate);

                    existing.setMealDate(mealDate);
                    if (mealMenu  != null) existing.setMealMenu(mealMenu);
                    if (feastNote != null) existing.setFeastNote(feastNote);
                    if (mealPrice != null) existing.setMealPrice(mealPrice);

                    existing.setTotalTokensSold(0L);
                    existing.setTotalTokensUsed(0L);
                    existing.setTotalTokensUnused(0L);
                    existing.setTotalRevenue(0L);
                    existing.setFinalized(false);
                    existing.setFinalizedAt(null);
                    return existing;
                })
                .orElseGet(() -> {
                    logger.debug("Creating summary row: {} {}", hallShortName, mealType);
                    return HallMealSummary.builder()
                            .hallShortName(hallShortName)
                            .mealType(mealType)
                            .mealDate(mealDate)
                            .mealMenu(mealMenu)
                            .mealPrice(mealPrice)
                            .feastNote(feastNote)
                            .totalTokensSold(0L)
                            .totalTokensUsed(0L)
                            .totalTokensUnused(0L)
                            .totalRevenue(0L)
                            .isFinalized(false)
                            .build();
                });
    }
}