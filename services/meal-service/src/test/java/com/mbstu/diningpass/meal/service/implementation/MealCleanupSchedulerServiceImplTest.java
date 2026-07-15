package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.repository.HallMealSummaryRepository;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MealCleanupSchedulerServiceImplTest {

    @Mock private MealTokenRepository tokenRepo;
    @Mock private PaymentRepository paymentRepo;
    @Mock private HallMealSummaryRepository summaryRepo;
    @Mock private HallMealSummaryService hallMealSummaryService;
    @Mock private MealConfigRepository mealConfigRepository;
    @Mock private CacheManager cacheManager;
    @Mock private Cache cache;

    @InjectMocks
    private MealCleanupSchedulerServiceImpl cleanupService;

    private static final String HALL = "JAMH";

    @Nested
    @DisplayName("cleanupIfNotDone")
    class CleanupIfNotDone {

        @Test
        @DisplayName("skips token/payment cleanup entirely when no halls have tokens for the date")
        void skipsWhenNoTokens() {
            LocalDate date = LocalDate.now();
            when(tokenRepo.findDistinctHallShortNameByMealDateAndMealType(date, MealType.LUNCH))
                    .thenReturn(List.of());
            when(mealConfigRepository.findHallsWithExpiredConfigs(any(), any()))
                    .thenReturn(List.of());

            cleanupService.cleanupIfNotDone(date, MealType.LUNCH);

            verify(tokenRepo, never()).deleteByMealDateAndMealType(any(), any());
            verify(paymentRepo, never()).deleteByMealDate(any());
        }

        @Test
        @DisplayName("expires no-shows, finalizes summary, deletes tokens, and skips already-finalized halls")
        void expiresNoShowsAndDeletesTokens() {
            LocalDate date = LocalDate.now();

            when(tokenRepo.findDistinctHallShortNameByMealDateAndMealType(date, MealType.LUNCH))
                    .thenReturn(List.of(HALL, "OTHER_HALL"));
            when(summaryRepo.existsByHallShortNameAndMealTypeAndIsFinalizedTrue(HALL, MealType.LUNCH))
                    .thenReturn(false);
            when(summaryRepo.existsByHallShortNameAndMealTypeAndIsFinalizedTrue("OTHER_HALL", MealType.LUNCH))
                    .thenReturn(true); // already done -> should be skipped

            MealToken noShow = MealToken.builder()
                    .id(UUID.randomUUID())
                    .hallShortName(HALL)
                    .mealDate(date)
                    .mealType(MealType.LUNCH)
                    .tokenStatus(TokenStatus.APPROVED)
                    .build();

            when(tokenRepo.findByHallShortNameAndMealDateAndMealTypeAndTokenStatus(
                    HALL, date, MealType.LUNCH, TokenStatus.APPROVED))
                    .thenReturn(List.of(noShow));

            when(tokenRepo.deleteByMealDateAndMealType(date, MealType.LUNCH)).thenReturn(3);
            when(mealConfigRepository.findHallsWithExpiredConfigs(any(), any())).thenReturn(List.of());

            cleanupService.cleanupIfNotDone(date, MealType.LUNCH);

            // Hall with no-shows is processed
            verify(tokenRepo).save(argThat(t -> t.getTokenStatus() == TokenStatus.CANCELLED));
            verify(hallMealSummaryService).onTokenExpired(HALL, date, MealType.LUNCH);
            verify(summaryRepo).finalizeForHallAndMealType(HALL, MealType.LUNCH);

            // Already-finalized hall is skipped entirely
            verify(tokenRepo, never()).findByHallShortNameAndMealDateAndMealTypeAndTokenStatus(
                    eq("OTHER_HALL"), any(), any(), any());

            // Token deletion runs once for the whole date/mealType (covers all halls)
            verify(tokenRepo).deleteByMealDateAndMealType(date, MealType.LUNCH);

            // Payments are only deleted after DINNER cleanup, not LUNCH
            verify(paymentRepo, never()).deleteByMealDate(any());
        }

        @Test
        @DisplayName("deletes payments only when cleaning up DINNER (end of day)")
        void deletesPaymentsOnlyAfterDinner() {
            LocalDate date = LocalDate.now();

            when(tokenRepo.findDistinctHallShortNameByMealDateAndMealType(date, MealType.DINNER))
                    .thenReturn(List.of(HALL));
            when(summaryRepo.existsByHallShortNameAndMealTypeAndIsFinalizedTrue(HALL, MealType.DINNER))
                    .thenReturn(false);
            when(tokenRepo.findByHallShortNameAndMealDateAndMealTypeAndTokenStatus(
                    HALL, date, MealType.DINNER, TokenStatus.APPROVED))
                    .thenReturn(List.of());
            when(tokenRepo.deleteByMealDateAndMealType(date, MealType.DINNER)).thenReturn(0);
            when(paymentRepo.deleteByMealDate(date)).thenReturn(5);
            when(mealConfigRepository.findHallsWithExpiredConfigs(any(), any())).thenReturn(List.of());

            cleanupService.cleanupIfNotDone(date, MealType.DINNER);

            verify(paymentRepo).deleteByMealDate(date);
        }

        @Test
        @DisplayName("deletes expired meal configs per hall and evicts their cache entries")
        void deletesExpiredConfigsAndEvictsCache() {
            LocalDate date = LocalDate.now();

            when(tokenRepo.findDistinctHallShortNameByMealDateAndMealType(date, MealType.LUNCH))
                    .thenReturn(List.of());
            when(mealConfigRepository.findHallsWithExpiredConfigs(any(LocalDate.class), any(LocalTime.class)))
                    .thenReturn(List.of(HALL));
            when(mealConfigRepository.deleteExpiredConfigs(eq(HALL), any(), any())).thenReturn(2);
            when(cacheManager.getCache("mealConfigs")).thenReturn(cache);

            cleanupService.cleanupIfNotDone(date, MealType.LUNCH);

            verify(mealConfigRepository).deleteExpiredConfigs(eq(HALL), any(), any());
            verify(cache).evict(HALL);
        }
    }

    @Test
    @DisplayName("cleanupAnythingOlderThan re-runs cleanup for every orphaned (date, mealType) pair found")
    void cleanupAnythingOlderThanReRunsForOrphans() {
        LocalDate cutoff = LocalDate.now().minusDays(1);
        LocalDate orphanDate = cutoff.minusDays(3);

        Object[] row = new Object[]{orphanDate, MealType.LUNCH};
        List<Object[]> missedRows = java.util.Collections.singletonList(row);
        when(tokenRepo.findDistinctMealDateAndTypeOlderThan(cutoff)).thenReturn(missedRows);

        // stub out the internals of the recursive cleanupIfNotDone call for the orphan date
        when(tokenRepo.findDistinctHallShortNameByMealDateAndMealType(orphanDate, MealType.LUNCH))
                .thenReturn(List.of());
        when(mealConfigRepository.findHallsWithExpiredConfigs(any(), any())).thenReturn(List.of());

        cleanupService.cleanupAnythingOlderThan(cutoff);

        verify(tokenRepo).findDistinctHallShortNameByMealDateAndMealType(orphanDate, MealType.LUNCH);
    }

    @Test
    @DisplayName("cleanupAnythingOlderThan does nothing when there are no orphaned records")
    void cleanupAnythingOlderThanNoOrphans() {
        LocalDate cutoff = LocalDate.now().minusDays(1);
        when(tokenRepo.findDistinctMealDateAndTypeOlderThan(cutoff)).thenReturn(List.of());

        cleanupService.cleanupAnythingOlderThan(cutoff);

        verify(tokenRepo, never()).findDistinctHallShortNameByMealDateAndMealType(any(), any());
    }
}