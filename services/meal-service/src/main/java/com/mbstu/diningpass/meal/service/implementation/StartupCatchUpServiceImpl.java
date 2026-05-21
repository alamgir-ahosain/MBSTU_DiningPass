package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.service.abstraction.MealCleanupSchedulerService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

@Component
@RequiredArgsConstructor
public class StartupCatchUpServiceImpl {

    private final MealCleanupSchedulerService cleanupScheduler;

    Logger log= LoggerFactory.getLogger(StartupCatchUpServiceImpl.class);
    // The times that match your two @Scheduled cron jobs
    private static final LocalTime LUNCH_CLEANUP_TIME  = LocalTime.of(15, 0);  // 3:00 PM
    private static final LocalTime DINNER_CLEANUP_TIME = LocalTime.of(22, 0);  // 10:00 PM

    // Runs once after Spring context is fully initialized
    @EventListener(ApplicationReadyEvent.class)
    public void catchUpMissedCleanups() {

        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now(ZoneId.of("Asia/Dhaka"));

        log.info("=== Startup catch-up check at {} ===", now);

        // --- Today's missed cleanups ---
        // If app restarted after the scheduled time, run those now
        if (now.isAfter(LUNCH_CLEANUP_TIME)) {
            log.info("Current time {} is past LUNCH cleanup time — checking today's LUNCH", now);
            cleanupScheduler.cleanupIfNotDone(today, MealType.LUNCH);
        }

        if (now.isAfter(DINNER_CLEANUP_TIME)) {
            log.info("Current time {} is past DINNER cleanup time — checking today's DINNER", now);
            cleanupScheduler.cleanupIfNotDone(today, MealType.DINNER);
        }


        // --- Yesterday's missed cleanups ---
        // Handles case where app was completely down yesterday evening
        LocalDate yesterday = today.minusDays(1);
        cleanupScheduler.cleanupIfNotDone(yesterday, MealType.LUNCH);
        cleanupScheduler.cleanupIfNotDone(yesterday, MealType.DINNER);

        // --- Anything older (safety net) ---
        // Handles extended downtime — finds all orphaned records before yesterday
        cleanupScheduler.cleanupAnythingOlderThan(yesterday);

        log.info("=== Startup catch-up complete ===");
    }
}