package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.dto.request.qr.StaffScanRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.qr.QrClaims;
import com.mbstu.diningpass.meal.dto.response.qr.QrScanResponse;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.exception.QrTokenInvalidException;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;
import com.mbstu.diningpass.meal.service.abstraction.TokenLockService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QrScanServiceImplTest {

    private static final ZoneId DHAKA = ZoneId.of("Asia/Dhaka");

    @Mock private MealTokenRepository tokenRepo;
    @Mock private QrTokenService qrTokenService;
    @Mock private TokenLockService tokenLockService;
    @Mock private HallAssociateFeignClient hallAssociateFeignClient;
    @Mock private HallMealSummaryService hallMealSummaryService;
    @Mock private CacheManager cacheManager;

    @InjectMocks
    private QrScanServiceImpl qrScanService;

    private UUID staffId;
    private UUID tokenId;
    private StaffScanRequest request;
    private HallAssociateProfileResponse staffProfile;

    @BeforeEach
    void setUp() {
        staffId = UUID.randomUUID();
        tokenId = UUID.randomUUID();
        request = new StaffScanRequest("raw-jwt-data");
        staffProfile = new HallAssociateProfileResponse(
                "Staff", "s@mbstu.ac.bd", "017", Role.HALL_STAFF, "JAMH", true, null, null);
    }

    private QrClaims claimsFor(String hall, LocalDate mealDate) {
        return new QrClaims(tokenId, UUID.randomUUID(), hall, mealDate, MealType.LUNCH);
    }

    @Test
    @DisplayName("rejects a QR that belongs to a different hall")
    void rejectsWrongHall() {
        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("OTHER_HALL", LocalDate.now(DHAKA)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);

        QrScanResponse response = qrScanService.staffScan(staffId, Role.HALL_STAFF, request);

        assertThat(response.valid()).isFalse();
        assertThat(response.result()).isEqualTo("WRONG_HALL");
        verifyNoInteractions(tokenRepo);
    }

    @Test
    @DisplayName("rejects a QR that is not for today's date")
    void rejectsWrongDate() {
        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("JAMH", LocalDate.now(DHAKA).minusDays(1)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);

        QrScanResponse response = qrScanService.staffScan(staffId, Role.HALL_STAFF, request);

        assertThat(response.valid()).isFalse();
        assertThat(response.result()).isEqualTo("WRONG_DATE");
    }

    @Test
    @DisplayName("throws QrTokenInvalidException when the token id does not exist in DB")
    void throwsWhenTokenNotFound() {
        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("JAMH", LocalDate.now(DHAKA)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);
        when(tokenRepo.findById(tokenId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> qrScanService.staffScan(staffId, Role.HALL_STAFF, request))
                .isInstanceOf(QrTokenInvalidException.class);
    }

    @Test
    @DisplayName("rejects a token that has already been used")
    void rejectsAlreadyUsedToken() {
        MealToken usedToken = MealToken.builder()
                .id(tokenId)
                .hallShortName("JAMH")
                .mealDate(LocalDate.now(DHAKA))
                .mealType(MealType.LUNCH)
                .tokenStatus(TokenStatus.USED)
                .build();

        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("JAMH", LocalDate.now(DHAKA)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);
        when(tokenRepo.findById(tokenId)).thenReturn(Optional.of(usedToken));

        QrScanResponse response = qrScanService.staffScan(staffId, Role.HALL_STAFF, request);

        assertThat(response.result()).isEqualTo("ALREADY_USED");
        verifyNoInteractions(tokenLockService);
    }

    @Test
    @DisplayName("rejects a token whose payment has not been approved yet")
    void rejectsNotApprovedToken() {
        MealToken pendingToken = MealToken.builder()
                .id(tokenId)
                .hallShortName("JAMH")
                .mealDate(LocalDate.now(DHAKA))
                .mealType(MealType.LUNCH)
                .tokenStatus(TokenStatus.UNUSED)
                .build();

        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("JAMH", LocalDate.now(DHAKA)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);
        when(tokenRepo.findById(tokenId)).thenReturn(Optional.of(pendingToken));

        QrScanResponse response = qrScanService.staffScan(staffId, Role.HALL_STAFF, request);

        assertThat(response.result()).isEqualTo("NOT_APPROVED");
    }

    @Test
    @DisplayName("marks the token USED, updates the summary, and returns VALID on a successful scan")
    void marksTokenUsedOnSuccessfulScan() {
        MealToken approvedToken = MealToken.builder()
                .id(tokenId)
                .hallShortName("JAMH")
                .mealDate(LocalDate.now(DHAKA))
                .mealType(MealType.LUNCH)
                .tokenStatus(TokenStatus.APPROVED)
                .build();

        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("JAMH", LocalDate.now(DHAKA)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);
        when(tokenRepo.findById(tokenId)).thenReturn(Optional.of(approvedToken));
        when(tokenLockService.tryClaim(eq("qr:used:" + tokenId), any(Duration.class)))
                .thenReturn(true);

        QrScanResponse response = qrScanService.staffScan(staffId, Role.HALL_STAFF, request);

        assertThat(response.valid()).isTrue();
        assertThat(response.result()).isEqualTo("VALID");
        assertThat(approvedToken.getTokenStatus()).isEqualTo(TokenStatus.USED);
        assertThat(approvedToken.getScannedById()).isEqualTo(staffId);
        assertThat(approvedToken.getUsedAt()).isNotNull();

        verify(tokenRepo).save(approvedToken);
        verify(hallMealSummaryService).onTokenUsed("JAMH", approvedToken.getMealDate(), MealType.LUNCH);
    }

    @Test
    @DisplayName("rejects a double-scan race where the lock claim fails (already claimed by a concurrent scan)")
    void rejectsRedisRaceCondition() {
        MealToken approvedToken = MealToken.builder()
                .id(tokenId)
                .hallShortName("JAMH")
                .mealDate(LocalDate.now(DHAKA))
                .mealType(MealType.LUNCH)
                .tokenStatus(TokenStatus.APPROVED)
                .build();

        when(qrTokenService.parseAndValidate("raw-jwt-data"))
                .thenReturn(claimsFor("JAMH", LocalDate.now(DHAKA)));
        when(hallAssociateFeignClient.getMyProfile()).thenReturn(staffProfile);
        when(tokenRepo.findById(tokenId)).thenReturn(Optional.of(approvedToken));
        when(tokenLockService.tryClaim(anyString(), any(Duration.class)))
                .thenReturn(false); // another concurrent scan already claimed it

        QrScanResponse response = qrScanService.staffScan(staffId, Role.HALL_STAFF, request);

        assertThat(response.result()).isEqualTo("ALREADY_USED");
        verify(tokenRepo, never()).save(any());
    }
}