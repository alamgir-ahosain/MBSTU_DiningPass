package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.summary.HallMealSummaryResponse;
import com.mbstu.diningpass.meal.entity.HallMealSummary;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.exception.ForbiddenException;
import com.mbstu.diningpass.meal.repository.HallMealSummaryRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HallMealSummaryServiceImplTest {

    @Mock
    private HallMealSummaryRepository summaryRepo;

    @Mock
    private HallAssociateFeignClient hallAssociateFeignClient;

    @InjectMocks
    private HallMealSummaryServiceImpl hallMealSummaryService;

    private static final String HALL = "JAMH";

    @Nested
    @DisplayName("onPaymentApproved")
    class OnPaymentApproved {

        @Test
        @DisplayName("increments sold count and revenue for an existing same-day summary")
        void incrementsExistingSummary() {
            LocalDate today = LocalDate.now();
            HallMealSummary existing = HallMealSummary.builder()
                    .hallShortName(HALL)
                    .mealType(MealType.LUNCH)
                    .mealDate(today)
                    .totalTokensSold(3L)
                    .totalRevenue(180L)
                    .build();

            when(summaryRepo.findByHallShortNameAndMealType(HALL, MealType.LUNCH))
                    .thenReturn(Optional.of(existing));

            hallMealSummaryService.onPaymentApproved(HALL, today, MealType.LUNCH, 60L, "Rice", null);

            assertThat(existing.getTotalTokensSold()).isEqualTo(4L);
            assertThat(existing.getTotalRevenue()).isEqualTo(240L);
            verify(summaryRepo).save(existing);
        }

        @Test
        @DisplayName("resets counters when the meal date has rolled over to a new day")
        void resetsCountersOnNewDay() {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            LocalDate today = LocalDate.now();

            HallMealSummary existing = HallMealSummary.builder()
                    .hallShortName(HALL)
                    .mealType(MealType.LUNCH)
                    .mealDate(yesterday)
                    .totalTokensSold(20L)
                    .totalTokensUsed(18L)
                    .totalTokensUnused(2L)
                    .totalRevenue(1200L)
                    .isFinalized(true)
                    .build();

            when(summaryRepo.findByHallShortNameAndMealType(HALL, MealType.LUNCH))
                    .thenReturn(Optional.of(existing));

            hallMealSummaryService.onPaymentApproved(HALL, today, MealType.LUNCH, 60L, "New menu", "Feast");

            assertThat(existing.getMealDate()).isEqualTo(today);
            assertThat(existing.getTotalTokensSold()).isEqualTo(1L);   // reset then +1
            assertThat(existing.getTotalTokensUsed()).isZero();
            assertThat(existing.getTotalTokensUnused()).isZero();
            assertThat(existing.getTotalRevenue()).isEqualTo(60L);
            assertThat(existing.isFinalized()).isFalse();
            assertThat(existing.getMealMenu()).isEqualTo("New menu");
            assertThat(existing.getFeastNote()).isEqualTo("Feast");
        }

        @Test
        @DisplayName("creates a new summary row when none exists yet")
        void createsNewSummaryWhenAbsent() {
            LocalDate today = LocalDate.now();
            when(summaryRepo.findByHallShortNameAndMealType(HALL, MealType.DINNER))
                    .thenReturn(Optional.empty());

            hallMealSummaryService.onPaymentApproved(HALL, today, MealType.DINNER, 70L, "Khichuri", null);

            verify(summaryRepo).save(argThat(s ->
                    s.getHallShortName().equals(HALL)
                            && s.getMealType() == MealType.DINNER
                            && s.getTotalTokensSold() == 1L
                            && s.getTotalRevenue() == 70L
            ));
        }
    }

    @Test
    @DisplayName("onTokenUsed increments the used counter")
    void onTokenUsedIncrementsUsedCount() {
        LocalDate today = LocalDate.now();
        HallMealSummary existing = HallMealSummary.builder()
                .hallShortName(HALL).mealType(MealType.LUNCH).mealDate(today)
                .totalTokensUsed(5L).build();

        when(summaryRepo.findByHallShortNameAndMealType(HALL, MealType.LUNCH))
                .thenReturn(Optional.of(existing));

        hallMealSummaryService.onTokenUsed(HALL, today, MealType.LUNCH);

        assertThat(existing.getTotalTokensUsed()).isEqualTo(6L);
        verify(summaryRepo).save(existing);
    }

    @Test
    @DisplayName("onTokenExpired increments the unused counter")
    void onTokenExpiredIncrementsUnusedCount() {
        LocalDate today = LocalDate.now();
        HallMealSummary existing = HallMealSummary.builder()
                .hallShortName(HALL).mealType(MealType.DINNER).mealDate(today)
                .totalTokensUnused(2L).build();

        when(summaryRepo.findByHallShortNameAndMealType(HALL, MealType.DINNER))
                .thenReturn(Optional.of(existing));

        hallMealSummaryService.onTokenExpired(HALL, today, MealType.DINNER);

        assertThat(existing.getTotalTokensUnused()).isEqualTo(3L);
        verify(summaryRepo).save(existing);
    }

    @Nested
    @DisplayName("getAllHallMealSummary")
    class GetAllHallMealSummary {

        @Test
        @DisplayName("throws ForbiddenException for a STUDENT requester")
        void throwsForbiddenForStudent() {
            assertThatThrownBy(() ->
                    hallMealSummaryService.getAllHallMealSummary(UUID.randomUUID(), Role.STUDENT, 0, 20))
                    .isInstanceOf(ForbiddenException.class);

            verifyNoInteractions(hallAssociateFeignClient);
        }

        @Test
        @DisplayName("throws ForbiddenException when requester has no hall assigned")
        void throwsForbiddenWhenNoHallAssigned() {
            HallAssociateProfileResponse profile = new HallAssociateProfileResponse(
                    "Staff", "s@mbstu.ac.bd", "017", Role.HALL_STAFF, null, true, null, null);
            when(hallAssociateFeignClient.getMyProfile()).thenReturn(profile);

            assertThatThrownBy(() ->
                    hallMealSummaryService.getAllHallMealSummary(UUID.randomUUID(), Role.HALL_STAFF, 0, 20))
                    .isInstanceOf(ForbiddenException.class);
        }

        @Test
        @DisplayName("returns a paged, mapped list of summaries for an authorized requester")
        void returnsPagedSummaries() {
            HallAssociateProfileResponse profile = new HallAssociateProfileResponse(
                    "Admin", "a@mbstu.ac.bd", "017", Role.HALL_ADMIN, HALL, true, null, null);
            when(hallAssociateFeignClient.getMyProfile()).thenReturn(profile);

            HallMealSummary summary = HallMealSummary.builder()
                    .id(UUID.randomUUID())
                    .hallShortName(HALL)
                    .mealDate(LocalDate.now())
                    .mealType(MealType.LUNCH)
                    .mealMenu("Rice")
                    .mealPrice(60L)
                    .totalTokensSold(10L)
                    .totalTokensUsed(8L)
                    .totalTokensUnused(2L)
                    .totalRevenue(600L)
                    .isFinalized(false)
                    .build();

            Page<HallMealSummary> page = new PageImpl<>(java.util.List.of(summary));
            when(summaryRepo.findByHallShortName(eq(HALL), any(Pageable.class))).thenReturn(page);

            Page<HallMealSummaryResponse> result =
                    hallMealSummaryService.getAllHallMealSummary(UUID.randomUUID(), Role.HALL_ADMIN, 0, 20);

            assertThat(result.getTotalElements()).isEqualTo(1);
            HallMealSummaryResponse dto = result.getContent().get(0);
            assertThat(dto.hallShortName()).isEqualTo(HALL);
            assertThat(dto.totalTokensSold()).isEqualTo(10L);
        }
    }
}
