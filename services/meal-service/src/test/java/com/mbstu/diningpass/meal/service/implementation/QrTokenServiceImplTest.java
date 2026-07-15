package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.dto.response.qr.QrClaims;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.exception.QrTokenExpiredException;
import com.mbstu.diningpass.meal.exception.QrTokenInvalidException;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link QrTokenServiceImpl}.
 * <p>
 * Uses a real in-memory HMAC key (no Spring context) so the JWT
 * sign/verify round-trip is exercised exactly as in production.
 */
class QrTokenServiceImplTest {

    // Any >= 256-bit secret works for HS256/HS512 depending on jjwt version.
    private static final Key KEY =
            Keys.hmacShaKeyFor("this-is-a-32-byte-test-secret-key!!".getBytes());

    private QrTokenServiceImpl qrTokenService;
    private MealToken token;

    @BeforeEach
    void setUp() {
        ZoneId dhaka = ZoneId.of("Asia/Dhaka");
        qrTokenService = new QrTokenServiceImpl(KEY);
        token = MealToken.builder()
                .id(UUID.randomUUID())
                .studentId(UUID.randomUUID())
                .hallShortName("JAMH")
                .mealDate(LocalDate.now(dhaka))
                .mealType(MealType.LUNCH)
                .build();
    }

    @Test
    @DisplayName("generates a JWT that parses back into the same claims")
    void generatesAndParsesRoundTrip() {

        ZoneId dhaka = ZoneId.of("Asia/Dhaka");
        LocalTime tokenExpires = LocalTime.now(dhaka).plusHours(2);

        String jwt = qrTokenService.generateMealQrToken(token, tokenExpires);
        assertThat(jwt).isNotBlank();

        QrClaims claims = qrTokenService.parseAndValidate(jwt);

        assertThat(claims.tokenId()).isEqualTo(token.getId());
        assertThat(claims.studentId()).isEqualTo(token.getStudentId());
        assertThat(claims.hallShortName()).isEqualTo(token.getHallShortName());
        assertThat(claims.mealDate()).isEqualTo(token.getMealDate());
        assertThat(claims.mealType()).isEqualTo(token.getMealType());
    }

    @Test
    @DisplayName("throws QrTokenInvalidException for a blank token")
    void throwsInvalidForBlankToken() {
        assertThatThrownBy(() -> qrTokenService.parseAndValidate(" "))
                .isInstanceOf(QrTokenInvalidException.class);
        assertThatThrownBy(() -> qrTokenService.parseAndValidate(null))
                .isInstanceOf(QrTokenInvalidException.class);
    }

    @Test
    @DisplayName("throws QrTokenExpiredException for an already-expired token")
    void throwsExpiredForPastExpiry() {
        String jwt = Jwts.builder()
                .claim("tokenId", token.getId().toString())
                .claim("studentId", token.getStudentId().toString())
                .claim("hall", token.getHallShortName())
                .claim("mealDate", token.getMealDate().toString())
                .claim("mealType", token.getMealType().name())
                .claim("type", "MEAL_TOKEN")
                .issuedAt(Date.from(Instant.now().minusSeconds(3600)))
                .expiration(Date.from(Instant.now().minusSeconds(60))) // already expired
                .signWith(KEY)
                .compact();

        assertThatThrownBy(() -> qrTokenService.parseAndValidate(jwt))
                .isInstanceOf(QrTokenExpiredException.class);
    }

    @Test
    @DisplayName("throws QrTokenInvalidException for a token signed with a different key")
    void throwsInvalidForBadSignature() {
        Key otherKey = Keys.hmacShaKeyFor("a-completely-different-32-byte-key!".getBytes());

        String jwt = Jwts.builder()
                .claim("tokenId", token.getId().toString())
                .claim("type", "MEAL_TOKEN")
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(otherKey)
                .compact();

        assertThatThrownBy(() -> qrTokenService.parseAndValidate(jwt))
                .isInstanceOf(QrTokenInvalidException.class);
    }

    @Test
    @DisplayName("throws QrTokenInvalidException when the 'type' claim is not MEAL_TOKEN")
    void throwsInvalidForWrongTokenType() {
        String jwt = Jwts.builder()
                .claim("tokenId", token.getId().toString())
                .claim("type", "SOME_OTHER_TOKEN")
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(KEY)
                .compact();

        assertThatThrownBy(() -> qrTokenService.parseAndValidate(jwt))
                .isInstanceOf(QrTokenInvalidException.class)
                .hasMessageContaining("Not a meal token QR");
    }
}
