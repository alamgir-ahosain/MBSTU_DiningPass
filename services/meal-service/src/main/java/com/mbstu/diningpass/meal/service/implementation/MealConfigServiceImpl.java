package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.dto.request.mealconfig.CreateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.request.mealconfig.UpdateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.mealconfig.MealConfigAdminResponse;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.exception.BadRequestException;
import com.mbstu.diningpass.meal.exception.DuplicateResourceException;
import com.mbstu.diningpass.meal.exception.ForbiddenException;
import com.mbstu.diningpass.meal.exception.ResourceNotFoundException;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.service.abstraction.MealConfigService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MealConfigServiceImpl implements MealConfigService {

    private static final Logger logger = LoggerFactory.getLogger(MealConfigServiceImpl.class);

    private final MealConfigRepository mealConfigRepository;
    private final HallAssociateFeignClient hallAssociateFeignClient;





    @Override
    public MealConfigAdminResponse createMealConfig(UUID requesterId, Role role, CreateMealConfigRequest request) {

        HallAssociateProfileResponse creatorProfile =
                getAuthorizedHallProfile(
                        requesterId,
                        role,
                        "create meal configurations"
                );

        // Business rule: booking deadline must come before token expiry
        validateTimeWindow(request.mealDate(), request.cutTokenBefore(), request.tokenExpires());


        // Programmatic duplicate check (fast path — avoids hitting the DB constraint on every request)
        if (mealConfigRepository.existsByHallShortNameAndMealDateAndMealType(creatorProfile.hallShortName(), request.mealDate(), request.mealType())) {
            throw new DuplicateResourceException("A meal config already exists for " + creatorProfile.hallShortName() + " on " + request.mealDate() + " for " + request.mealType());
        }

        MealConfig newMealConfig = MealConfig.builder()
                .hallShortName(creatorProfile.hallShortName())
                .mealDate(request.mealDate())
                .mealType(request.mealType())
                .mealMenu(request.mealMenu())
                .mealPrice(request.mealPrice())
                .cutTokenBefore(request.cutTokenBefore())
                .tokenExpires(request.tokenExpires())
                .feastNote(request.feastNote())
                .createdBy(requesterId)
                .updatedBy(requesterId)
                .createdByName(creatorProfile.fullName())   // snapshot at creation time
                .updatedByName(creatorProfile.fullName())   // same as creator on first save
                .build();

        try {
            MealConfig saved = mealConfigRepository.save(newMealConfig);
            logger.info("[CREATE_MEAL_CONFIG] saved id={}", saved.getId());
            return mapToResponse(saved);
        } catch (DataIntegrityViolationException e) {
            // Safety net for race condition — two concurrent requests passing the check above
            throw new DuplicateResourceException("A meal config already exists for this hall, date, and meal type");
        }
    }







    @Override
    public List<MealConfigAdminResponse> getAllMealConfigs(UUID requesterId, Role role) {


        HallAssociateProfileResponse creatorProfile =
                getAuthorizedHallProfile(
                        requesterId,
                        role,
                        "view meal configurations"
                );

        return mealConfigRepository
                .findByHallShortNameOrderByMealDateDesc(creatorProfile.hallShortName())
                .stream()
                .map(this::mapToResponse)
                .toList();

    }





    @Override
    public MealConfigAdminResponse updateMealConfig(UUID requesterId, Role role, UUID configId, UpdateMealConfigRequest request) {

        HallAssociateProfileResponse updaterProfile =
                getAuthorizedHallProfile(
                        requesterId,
                        role,
                        "update meal configurations"
                );

        // Fetch config scoped to this admin's hall — prevents editing another hall's config
        MealConfig config = mealConfigRepository.findByIdAndHallShortName(configId, updaterProfile.hallShortName()).orElseThrow(() -> new ResourceNotFoundException("Meal config not found or does not belong to your hall"));

        logger.info("[UPDATE_MEAL_CONFIG] requester={} configId={} hall={}", requesterId, configId, updaterProfile.hallShortName());

        //  Resolve final values (merge: use request value if provided, else keep existing)

        LocalDate  mealDate  = config.getMealDate(); // date never changes on update
        LocalTime finalCutTokenBefore = request.cutTokenBefore() != null ? request.cutTokenBefore() : config.getCutTokenBefore();
        LocalTime finalTokenExpires = request.tokenExpires() != null ? request.tokenExpires() : config.getTokenExpires();

        // Business rule: booking deadline must come before token expiry
        validateTimeWindow(mealDate, finalCutTokenBefore, finalTokenExpires);




        //  Apply only non-null fields (null = "don't change this field") ──
        if (request.mealMenu() != null)       config.setMealMenu(request.mealMenu());
        if (request.mealPrice() != null)      config.setMealPrice(request.mealPrice());
        if (request.cutTokenBefore() != null) config.setCutTokenBefore(request.cutTokenBefore());
        if (request.tokenExpires() != null)   config.setTokenExpires(request.tokenExpires());
        if (request.isActive() != null)       config.setActive(request.isActive());
        if (request.feastNote() != null)      config.setFeastNote(request.feastNote());

        //  Update audit fields
        config.setUpdatedBy(requesterId);
        config.setUpdatedByName(updaterProfile.fullName());   // snapshot of who updated

        MealConfig saved = mealConfigRepository.save(config);
        logger.info("[UPDATE_MEAL_CONFIG] updated id={}", saved.getId());

        return mapToResponse(saved);
    }



//
//    public MessageResponse deleteMealConfig(UUID configId, UUID requesterId, Role role) {
//
//        if (role != Role.HALL_STAFF && role != Role.HALL_ADMIN) {
//            throw new ForbiddenException("Only Hall Staff and Hall Admins can delete meal configurations");
//        }
//
//        HallAssociateProfileResponse requesterProfile =
//                hallAssociateFeignClient.getMyProfile(requesterId, role);
//
//        if (requesterProfile.hallShortName() == null) {
//            throw new ForbiddenException("Your account has no hall assigned. Contact a Super Admin.");
//        }
//
//        MealConfig config = mealConfigRepository
//                .findByIdAndHallShortName(configId, requesterProfile.hallShortName())
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "Meal config not found or does not belong to your hall"));
//
//        logger.info("[DELETE_MEAL_CONFIG] requester={} configId={} hall={}",
//                requesterId, configId, requesterProfile.hallShortName());
//
//        long totalCut = mealTokenRepository.countByHallShortNameAndMealDateAndMealType(
//                config.getHallShortName(), config.getMealDate(), config.getMealType());
//
//        // Case 1 — no tokens booked at all, safe to delete directly
//        if (totalCut == 0) {
//            mealConfigRepository.delete(config);
//            logger.info("[DELETE_MEAL_CONFIG] deleted with no tokens id={}", configId);
//            return new MessageResponse("Meal configuration deleted successfully", true);
//        }
//
//        // Case 2 — tokens exist, check if meal is fully settled
//        long totalUsed    = mealTokenRepository.countUsedByHallShortNameAndMealDateAndMealType(
//                config.getHallShortName(), config.getMealDate(), config.getMealType());
//
//        long totalExpired = mealTokenRepository.countExpiredByHallShortNameAndMealDateAndMealType(
//                config.getHallShortName(), config.getMealDate(), config.getMealType());
//
//        long totalPending = totalCut - totalUsed - totalExpired;
//
//        // Still active tokens (PENDING_PAYMENT, APPROVED) — cannot delete yet
//        if (totalPending > 0) {
//            throw new BadRequestException(
//                    totalPending + " token(s) are still active for this meal. " +
//                            "Wait until all tokens are used or expired before deleting.");
//        }
//
//        // All tokens settled — archive summary then delete
//        long totalRevenue = totalUsed * config.getMealPrice();
//
//        MealConfigHistory history = MealConfigHistory.builder()
//                .mealConfigId(config.getId())
//                .hallShortName(config.getHallShortName())
//                .mealDate(config.getMealDate())
//                .mealType(config.getMealType())
//                .mealMenu(config.getMealMenu())
//                .mealPrice(config.getMealPrice())
//                .cutTokenBefore(config.getCutTokenBefore())
//                .tokenExpires(config.getTokenExpires())
//                .feastNote(config.getFeastNote())
//                .totalTokensCut(totalCut)
//                .totalTokensUsed(totalUsed)
//                .totalTokensExpired(totalExpired)
//                .totalRevenue(totalRevenue)
//                .createdByName(config.getCreatedByName())
//                .build();
//
//        mealConfigHistoryRepository.save(history);
//        mealConfigRepository.delete(config);
//
//        logger.info("[DELETE_MEAL_CONFIG] archived and deleted id={} revenue={}",
//                configId, totalRevenue);
//
//        return new MessageResponse("Meal configuration archived and deleted successfully", true);
//    }


    //  ________________________ Helpers __________________


    private HallAssociateProfileResponse getAuthorizedHallProfile(UUID requesterId, Role role, String action) {

        // Role validation
        if (role != Role.HALL_STAFF && role != Role.HALL_ADMIN) {throw new ForbiddenException("Only Hall Staff and Hall Admins can " + action);}

        // Fetch authenticated user's profile
        HallAssociateProfileResponse profile = hallAssociateFeignClient.getMyProfile();

        // Hall validation
        if (profile.hallShortName() == null) {

            if (role == Role.HALL_STAFF) {throw new ForbiddenException("Your account has no hall assigned. Contact a Hall Admin.");}
            throw new ForbiddenException("Your account has no hall assigned. Contact a Super Admin.");
        }
        return profile;
    }



    private void validateTimeWindow(LocalDate mealDate, LocalTime cutTokenBefore, LocalTime tokenExpires) {
        LocalDateTime cutoff = LocalDateTime.of(mealDate, cutTokenBefore);
        LocalDateTime expiry = LocalDateTime.of(mealDate, tokenExpires);

        if (!cutoff.isBefore(expiry)) {
            throw new BadRequestException("cutTokenBefore (" + cutoff + ") must be earlier than tokenExpires (" + expiry + ")");
        }
    }


    private boolean computeIsBookingOpen(MealConfig config) {
        LocalDateTime cutoff = LocalDateTime.of(config.getMealDate(), config.getCutTokenBefore());
        return LocalDateTime.now().isBefore(cutoff);
    }

    private boolean computeIsTokenValid(MealConfig config) {
        LocalDateTime expiry = LocalDateTime.of(config.getMealDate(), config.getTokenExpires());
        return LocalDateTime.now().isBefore(expiry);
    }

    private MealConfigAdminResponse mapToResponse(MealConfig config) {
        return new MealConfigAdminResponse(
                config.getId(),
                config.getHallShortName(),
                config.getMealDate(),
                config.getMealType(),
                config.getMealMenu(),
                config.getMealPrice(),
                config.getCutTokenBefore(),
                config.getTokenExpires(),
                config.isActive(),
                config.getFeastNote(),
                computeIsBookingOpen(config),
                computeIsTokenValid(config),     // bonus field for admin UI to show if tokens are still valid
                config.getCreatedByName(),
                config.getUpdatedByName(),
                config.getCreatedAt(),
                config.getUpdatedAt()
        );
    }
}