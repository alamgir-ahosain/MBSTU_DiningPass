package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.StudentFeignClient;
import com.mbstu.diningpass.meal.entity.MealConfig;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.exception.ForbiddenException;
import com.mbstu.diningpass.meal.repository.MealConfigRepository;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.repository.PaymentRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.dto.response.mealtoken.MealTokenStudentResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link MealTokenServiceImpl}.
 * <p>
 * Only {@code getMyMealToken} contains active logic — the {@code cutToken}
 * method is commented out in the source and therefore not tested here.
 */
@ExtendWith(MockitoExtension.class)
class MealTokenServiceImplTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private MealTokenRepository mealTokenRepository;
    @Mock private MealConfigRepository mealConfigRepository;
    @Mock private StudentFeignClient studentFeignClient;
    @Mock private HallMealSummaryService hallMealSummaryService;

    @InjectMocks
    private MealTokenServiceImpl mealTokenService;

    private UUID studentId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
    }

    @Test
    @DisplayName("throws ForbiddenException when caller is not a STUDENT")
    void throwsForbiddenForNonStudent() {
        assertThatThrownBy(() -> mealTokenService.getMyMealToken(studentId, Role.HALL_STAFF))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Only students");

        verifyNoInteractions(mealTokenRepository);
    }

    @Test
    @DisplayName("returns an empty list when the student has no APPROVED tokens")
    void returnsEmptyListWhenNoTokens() {
        when(mealTokenRepository.findByStudentIdAndTokenStatus(studentId, TokenStatus.APPROVED)).thenReturn(List.of());
        List<MealTokenStudentResponse> result = mealTokenService.getMyMealToken(studentId, Role.STUDENT);
        assertThat(result).isEmpty();
        verifyNoInteractions(mealConfigRepository);
    }

    @Test
    @DisplayName("maps APPROVED tokens to UNUSED status for the student view and formats expiry time")
    void mapsApprovedTokensToUnusedWithFormattedExpiry() {
        LocalDate mealDate = LocalDate.now().plusDays(1);
        UUID tokenId = UUID.randomUUID();

        MealToken token = MealToken.builder()
                .id(tokenId)
                .paymentId(UUID.randomUUID())
                .studentId(studentId)
                .hallShortName("JAMH")
                .mealDate(mealDate)
                .mealType(MealType.LUNCH)
                .mealPrice(60L)
                .tokenStatus(TokenStatus.APPROVED)
                .qrCodeData("signed-jwt")
                .build();

        MealConfig config = MealConfig.builder()
                .hallShortName("JAMH")
                .mealDate(mealDate)
                .mealType(MealType.LUNCH)
                .mealMenu("Rice, Dal, Fish Curry")
                .mealPrice(60L)
                .cutTokenBefore(LocalTime.of(10, 0))
                .tokenExpires(LocalTime.of(14, 30))
                .build();

        when(mealTokenRepository.findByStudentIdAndTokenStatus(studentId, TokenStatus.APPROVED))
                .thenReturn(List.of(token));
        when(mealConfigRepository.findByHallShortNameAndMealDateIn(eq("JAMH"), anyList()))
                .thenReturn(List.of(config));

        List<MealTokenStudentResponse> result = mealTokenService.getMyMealToken(studentId, Role.STUDENT);

        assertThat(result).hasSize(1);
        MealTokenStudentResponse dto = result.get(0);
        assertThat(dto.id()).isEqualTo(tokenId);
        assertThat(dto.mealMenu()).isEqualTo("Rice, Dal, Fish Curry");
        assertThat(dto.tokenStatus()).isEqualTo(TokenStatus.UNUSED); // APPROVED shown as UNUSED
        assertThat(dto.tokenExpiry()).isEqualTo("02:30 PM");
        assertThat(dto.qrCodeData()).isEqualTo("signed-jwt");
    }
}
