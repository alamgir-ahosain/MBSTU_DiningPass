package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.dto.request.mealconfig.CreateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.request.mealconfig.UpdateMealConfigRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.client.StudentProfileResponse;
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
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MealConfigServiceImpl implements MealConfigService {

    private static final Logger logger = LoggerFactory.getLogger(MealConfigServiceImpl.class);

    private final MealConfigRepository mealConfigRepository;
    private final HallAssociateFeignClient hallAssociateFeignClient;

    private final CacheManager cacheManager; // Injected for manual cache eviction when needed
    private static final String CACHE_NAME = "mealConfigs";
    private final StudentFeignClient studentFeignClient;



    @Cacheable(value = "hallProfiles", key = "#requesterId")
    public HallAssociateProfileResponse getCachedProfile(UUID requesterId) {
        return hallAssociateFeignClient.getMyProfile();
    }



    @Override
    @Transactional
    public MealConfigAdminResponse createMealConfig(UUID requesterId, Role role, CreateMealConfigRequest request) {

        logger.info("meal-service/mealConfig: DIRECT DB CALL for createMealConfig");

        HallAssociateProfileResponse creatorProfile =
                getAuthorizedHallProfile(
                        requesterId,
                        role,
                        "create meal configurations"
                );

        String hallShortName = creatorProfile.hallShortName();

        // Business rule: booking deadline must come before token expiry
        validateTimeWindow(request.mealDate(), request.cutTokenBefore(), request.tokenExpires());


        // Programmatic duplicate check (fast path — avoids hitting the DB constraint on every request)
        if (mealConfigRepository.existsByHallShortNameAndMealDateAndMealType(hallShortName, request.mealDate(), request.mealType())) {
            throw new DuplicateResourceException("A meal config already exists for " + creatorProfile.hallShortName() + " on " + request.mealDate() + " for " + request.mealType());
        }

        MealConfig newMealConfig = MealConfig.builder()
                .hallShortName(hallShortName)
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

        MealConfig saved;
        try {
            saved = mealConfigRepository.save(newMealConfig);
            logger.info("[CREATE_MEAL_CONFIG] saved id={}", saved.getId());
        } catch (DataIntegrityViolationException e) {
            // Safety net for race condition — two concurrent requests passing the check above
            throw new DuplicateResourceException("A meal config already exists for " + hallShortName + " on " + request.mealDate() + " for " + request.mealType());
        }

        // Evict AFTER the transaction commits so no other thread reads stale data
        // from cache while this transaction is still in-flight.
        evictHallCache(hallShortName);

        return mapToResponse(saved);

    }






    @Override
    @Transactional(readOnly = true)
    public List<MealConfigAdminResponse> getAllMealConfigs(UUID requesterId, Role role) {

        String hallShortName;
        if (role == Role.STUDENT) {

            StudentProfileResponse studentProfile = studentFeignClient.getProfile();
            hallShortName = studentProfile.hallShortName();
            logger.info("[MEAL_CONFIG][GET_ALL] STUDENT requester={} hall={}", requesterId, hallShortName);

            return mealConfigRepository
                    .findByHallShortNameAndIsActiveTrueOrderByMealDateDesc(hallShortName)
                    .stream()
                    .filter(this::computeIsBookingOpen)
                    .map(this::mapToStudentResponse)
                    .collect(Collectors.toList());
        }

        // Admin / Staff
        HallAssociateProfileResponse creatorProfile = getAuthorizedHallProfile(requesterId, role, "view meal configurations");
        hallShortName = creatorProfile.hallShortName();
        logger.info("[MEAL_CONFIG][GET_ALL] CACHE MISS — querying DB hall={}", hallShortName);

        return mealConfigRepository
                .findByHallShortNameAndIsActiveTrueOrderByMealDateDesc(hallShortName)
                .stream()
                .filter(this::computeIsBookingOpen) // Only return configs that are still open for booking
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }




    @Override
    public MealConfigAdminResponse updateMealConfig(UUID requesterId, Role role, UUID configId, UpdateMealConfigRequest request) {

        HallAssociateProfileResponse updaterProfile =
                getAuthorizedHallProfile(
                        requesterId,
                        role,
                        "update meal configurations"
                );

        String hallShortName = updaterProfile.hallShortName();
        // Fetch config scoped to this admin's hall — prevents editing another hall's config
        MealConfig config = mealConfigRepository.findByIdAndHallShortName(configId, hallShortName).orElseThrow(() -> new ResourceNotFoundException("Meal config not found or does not belong to your hall"));

        logger.info("[UPDATE_MEAL_CONFIG] requester={} configId={} hall={}", requesterId, configId, hallShortName);

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

        evictHallCache(hallShortName);
        return mapToResponse(saved);
    }




    // Cache helpers

    /**
     * Returns the "mealConfigs" Cache, or null if Redis is unavailable.
     * Returning null makes all three CRUD methods degrade gracefully to
     * DB-only mode rather than throwing during a Redis outage.
     */
    private Cache resolveCache() {
        try {
            return cacheManager.getCache(CACHE_NAME);
        } catch (Exception e) {
            logger.warn("[MEAL_CONFIG][CACHE] could not resolve '{}': {}", CACHE_NAME, e.getMessage());
            return null;
        }
    }


    /**
     * Evicts the cache entry for a specific hall.
     *
     * Called after every write (create / update) so that the next read by ANY
     * staff member in that hall fetches fresh data from the DB.
     *
     * No-ops gracefully if the Cache or the key doesn't exist.
     */
    // Called after every write so all staff in the same hall see fresh data
    // on their next getAllMealConfigs request.
    private void evictHallCache(String hallShortName) {
        try {
            Cache cache = resolveCache();
            if (cache != null) {
                cache.evict(hallShortName);
                logger.info("[MEAL_CONFIG][CACHE] EVICT hall={}", hallShortName);
            }
        } catch (Exception e) {
            // Non-fatal — the 2-min TTL will expire the entry naturally.
            logger.warn("[MEAL_CONFIG][CACHE] EVICT failed hall={}: {}", hallShortName, e.getMessage());
        }
    }


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
        Long totalTokenPending= config.getTotalSold() - config.getTotalUsed();
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
                config.getTotalSold(),
                config.getTotalUsed(),
                totalTokenPending,
                computeIsBookingOpen(config),
                config.getCreatedByName(),
                config.getUpdatedByName(),
                config.getCreatedAt(),
                config.getUpdatedAt()
        );
    }

    private MealConfigAdminResponse mapToStudentResponse(MealConfig config) {
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
            null,    // totalSold    — admin only
            null,    // totalUsed    — admin only
            null,    // totalPending — admin only
            computeIsBookingOpen(config),
            null,    // createdByName — admin only
            null,    // updatedByName — admin only
            config.getCreatedAt(),
            null     // updatedAt    — admin only
    );
}
}