package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.client.HallAssociateFeignClient;
import com.mbstu.diningpass.meal.dto.request.qr.StaffScanRequest;
import com.mbstu.diningpass.meal.dto.response.client.HallAssociateProfileResponse;
import com.mbstu.diningpass.meal.dto.response.qr.QrClaims;
import com.mbstu.diningpass.meal.dto.response.qr.QrScanResponse;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.Role;
import com.mbstu.diningpass.meal.enums.ScanMode;
import com.mbstu.diningpass.meal.enums.TokenStatus;
import com.mbstu.diningpass.meal.exception.QrTokenInvalidException;
import com.mbstu.diningpass.meal.repository.MealTokenRepository;
import com.mbstu.diningpass.meal.service.abstraction.HallMealSummaryService;
import com.mbstu.diningpass.meal.service.abstraction.QrScanService;
import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;
import com.mbstu.diningpass.meal.service.abstraction.TokenLockService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@AllArgsConstructor
@Service
public class QrScanServiceImpl implements QrScanService {

    private static final ZoneId DHAKA = ZoneId.of("Asia/Dhaka");
    private static final String MEAL_TOKENS_CACHE = "mealTokens";
    private static final Logger logger = LoggerFactory.getLogger(QrScanServiceImpl.class);


    private final MealTokenRepository       tokenRepo;
    private final QrTokenService            qrTokenService;
    private final TokenLockService          tokenLockService;
    private final HallAssociateFeignClient hallAssociateFeignClient;
    private final HallMealSummaryService hallMealSummaryService;
    private final CacheManager cacheManager;






    @Override
    public QrScanResponse staffScan(UUID staffId, Role staffRole, StaffScanRequest request) {

        String rawQrJwt=request.qrCodeData();
        QrClaims qr = qrTokenService.parseAndValidate(rawQrJwt);
        HallAssociateProfileResponse profileResponse= hallAssociateFeignClient.getMyProfile();

        try {
            profileResponse = hallAssociateFeignClient.getMyProfile();
        } catch (Exception ex) {
            return fail("PROFILE_LOOKUP_FAILED", "Could not verify your hall profile. Please try again.");
        }

        if (!qr.hallShortName().equals(profileResponse.hallShortName())) return fail("WRONG_HALL", "This token belongs to a different hall.");
        if (!qr.mealDate().equals(LocalDate.now(DHAKA))) return fail("WRONG_DATE", "This token is not for today.");

        MealToken token = tokenRepo.findById(qr.tokenId()).orElseThrow(() -> new QrTokenInvalidException("Token not found."));

        if (token.getTokenStatus() == TokenStatus.USED) return fail("ALREADY_USED", "This meal has already been collected.");
        if (token.getTokenStatus() != TokenStatus.APPROVED) return fail("NOT_APPROVED", "Payment not verified yet.");

        String redisKey = "qr:used:" + token.getId();
//        Boolean claimed = redisTemplate.opsForValue().setIfAbsent(redisKey, "USED", Duration.ofHours(12));
//        if (Boolean.FALSE.equals(claimed)) return fail("ALREADY_USED", "This meal has already been collected.");

        boolean claimed = tokenLockService.tryClaim(redisKey, Duration.ofHours(12));
        if (!claimed) return fail("ALREADY_USED", "This meal has already been collected.");


        token.setTokenStatus(TokenStatus.USED);
        token.setUsedAt(LocalDateTime.now(DHAKA));
        token.setScanMode(ScanMode.STAFF_SCANNED);
        token.setScannedById(staffId);
        tokenRepo.save(token);

        // Student's cached "my tokens" list still shows this as APPROVED/UNUSED
        // until evicted — without this, students see a scanned token as unused
        // until the cache TTL expires (or forever, with the in-memory !redis cache).
        evictStudentTokenCache(token.getStudentId());


        hallMealSummaryService.onTokenUsed(
                token.getHallShortName(),
                token.getMealDate(),
                token.getMealType()
        );

        return success(token);
    }

    //  helpers

    private void evictStudentTokenCache(UUID studentId) {
        try{
            Cache cache = cacheManager.getCache(MEAL_TOKENS_CACHE);
            if (cache != null) {
                cache.evict("student:" + studentId);
                logger.info("[QR_SCAN][CACHE] evicted mealTokens for student={}", studentId);
            }
        } catch (Exception e) {
            logger.warn("[QR_SCAN][CACHE] evict failed for student={}: {}", studentId, e.getMessage());
        }
    }

    private QrScanResponse fail(String resultCode, String message) {
        return new QrScanResponse(false, resultCode, null, null, message);
    }


    private QrScanResponse success(MealToken token) {
        return new QrScanResponse(
                true,
                "VALID",
                token.getMealType().name(),
                token.getMealDate().toString(),
                "Meal collected successfully."
        );
    }
}