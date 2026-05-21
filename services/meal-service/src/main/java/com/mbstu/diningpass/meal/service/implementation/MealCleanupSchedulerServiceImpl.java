package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.repository.HallMealSummaryRepository;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.service.abstraction.MealCleanupSchedulerService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MealCleanupSchedulerServiceImpl implements MealCleanupSchedulerService {

    Logger log = LoggerFactory.getLogger(MealCleanupSchedulerServiceImpl.class);

    private final MealTokenRepository    tokenRepo;
    private final PaymentRepository      paymentRepo;
    private final HallMealSummaryRepository summaryRepo;
    private final HallMealSummaryService hallMealSummaryService;
    private final MealConfigRepository   mealConfigRepository;
    private final CacheManager           cacheManager;



    // Runs at 3:00 PM every day — LUNCH window is closed
    @Scheduled(cron = "0 0 15 * * *", zone = "Asia/Dhaka")
    @Override
    public void cleanupLunch() {
        log.info("Scheduled LUNCH cleanup triggered");
        cleanupIfNotDone(LocalDate.now(), MealType.LUNCH);
    }



    // Runs at 10:00 PM every day — DINNER window is closed
    @Scheduled(cron = "0 0 22 * * *", zone = "Asia/Dhaka")
    @Override
    public void cleanupDinner() {
        log.info("Scheduled DINNER cleanup triggered");
        cleanupIfNotDone(LocalDate.now(), MealType.DINNER);
    }


    // Idempotent cleanup — safe to call multiple times
    // Called by scheduler AND by StartupCatchUpService
    @Transactional
    @Override
    public void cleanupIfNotDone(LocalDate date, MealType mealType) {

        // Find all halls that have tokens for this date + meal type
        List<String> halls = tokenRepo.findDistinctHallShortNameByMealDateAndMealType(date, mealType);

        if (halls.isEmpty()) {
            log.info("No token records for {} {} — skipping token/payment cleanup", date, mealType);
        } else {
            // Step 1 + 2: per hall - expire no-shows and finalize summary
            halls.forEach(hallShortName -> {
                boolean alreadyDone = summaryRepo.existsByHallShortNameAndMealTypeAndIsFinalizedTrue(hallShortName, mealType);

                if (alreadyDone) {
                    log.info("Cleanup already done for {} {} — skipping", hallShortName, mealType);
                    return;
                }

                expireNoShowsAndFinalize(hallShortName, date, mealType);
            });

            // Step 3: delete tokens for this date + meal type (one query covers all halls)
            int tokensDeleted = tokenRepo.deleteByMealDateAndMealType(date, mealType);
            log.info("{} {} — deleted {} tokens", date, mealType, tokensDeleted);

            // Step 4: delete payments only after DINNER — one payment may cover both meals
            if (mealType == MealType.DINNER) {
                int paymentsDeleted = paymentRepo.deleteByMealDate(date);
                log.info("{} — deleted {} payments (end of day)", date, paymentsDeleted);
            }
        }

        // Step 5: delete expired meal configs for all halls
        // Safe to run regardless of whether tokens existed — configs expire independently
        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now(ZoneId.of("Asia/Dhaka"));

        List<String> hallsWithExpiredConfigs = mealConfigRepository.findHallsWithExpiredConfigs(today, now);

        if (hallsWithExpiredConfigs.isEmpty()) {
            log.info("No expired meal configs to delete");
        } else {
            hallsWithExpiredConfigs.forEach(hallShortName -> {
                int deleted = mealConfigRepository.deleteExpiredConfigs(hallShortName, today, now);
                if (deleted > 0) {
                    log.info("Deleted {} expired meal configs for hall {}", deleted, hallShortName);
                    evictMealConfigCache(hallShortName);
                }
            });
        }
    }




    // Safety net — finds any orphaned token records older than a given date
    // Called by StartupCatchUpService on startup
    @Transactional
    @Override
    public void cleanupAnythingOlderThan(LocalDate date) {

        List<Object[]> missed = tokenRepo.findDistinctMealDateAndTypeOlderThan(date);

        if (missed.isEmpty()) {
            log.info("No orphaned records older than {}", date);
            return;
        }

        missed.forEach(row -> {
            LocalDate missedDate = (LocalDate) row[0];
            MealType  missedType = MealType.valueOf((String) row[1]);
            log.warn("Found orphaned records for {} {} — running missed cleanup", missedDate, missedType);
            cleanupIfNotDone(missedDate, missedType);
        });
    }



    // Per-hall: mark no-shows CANCELLED + update summary + finalize summary row
    private void expireNoShowsAndFinalize(String hallShortName, LocalDate date, MealType mealType) {

        List<MealToken> noShows = tokenRepo.findByHallShortNameAndMealDateAndMealTypeAndTokenStatus(
                hallShortName, date, mealType, TokenStatus.APPROVED);

        noShows.forEach(token -> {
            token.setTokenStatus(TokenStatus.CANCELLED);
            tokenRepo.save(token);
            hallMealSummaryService.onTokenExpired(hallShortName, date, mealType);
        });

        log.info("{} {} {} — {} no-shows marked CANCELLED", hallShortName, date, mealType, noShows.size());

        summaryRepo.finalizeForHallAndMealType(hallShortName, mealType);
        log.info("{} {} — summary finalized", hallShortName, mealType);
    }




    // Evict meal config cache after deletion so admins don't see ghost entries
    private void evictMealConfigCache(String hallShortName) {
        try {
            Cache cache = cacheManager.getCache("mealConfigs");
            if (cache != null) {
                cache.evict(hallShortName);
                log.info("[CACHE] Evicted mealConfigs for hall={}", hallShortName);
            }
        } catch (Exception e) {
            log.warn("[CACHE] Evict failed for hall={}: {}", hallShortName, e.getMessage());
        }
    }
}