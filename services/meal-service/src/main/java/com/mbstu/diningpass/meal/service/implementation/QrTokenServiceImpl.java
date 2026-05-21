package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.dto.response.qr.QrClaims;
import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.enums.MealType;
import com.mbstu.diningpass.meal.exception.QrTokenExpiredException;
import com.mbstu.diningpass.meal.exception.QrTokenInvalidException;
import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.*;
import java.util.Date;
import java.util.UUID;

@Service
@AllArgsConstructor
public class QrTokenServiceImpl implements QrTokenService {

    private static final Logger logger = LoggerFactory.getLogger(QrTokenServiceImpl.class);
    private static final String CLAIM_TOKEN_ID   = "tokenId";
    private static final String CLAIM_STUDENT_ID = "studentId";
    private static final String CLAIM_HALL       = "hall";
    private static final String CLAIM_MEAL_DATE  = "mealDate";
    private static final String CLAIM_MEAL_TYPE  = "mealType";
    private static final String CLAIM_TYPE       = "type";
    private static final String TOKEN_TYPE_VALUE  = "MEAL_TOKEN";
    private static final ZoneId DHAKA            = ZoneId.of("Asia/Dhaka");

    private final Key secretKey;

    //  Generate

    @Override
    public String generateMealQrToken(MealToken token, LocalTime tokenExpires) {

        Instant now            = Instant.now();
        LocalDateTime expiryDT = LocalDateTime.of(token.getMealDate(), tokenExpires);
        Instant expiryInstant  = expiryDT.atZone(DHAKA).toInstant();

        logger.info("Generating QR token — tokenId={} studentId={} hall={} date={} type={}", token.getId(), token.getStudentId(), token.getHallShortName(), token.getMealDate(), token.getMealType());

        return Jwts.builder()
                .claim(CLAIM_TOKEN_ID,   token.getId().toString())
                .claim(CLAIM_STUDENT_ID, token.getStudentId().toString())
                .claim(CLAIM_HALL,       token.getHallShortName())
                .claim(CLAIM_MEAL_DATE,  token.getMealDate().toString())
                .claim(CLAIM_MEAL_TYPE,  token.getMealType().name())
                .claim(CLAIM_TYPE,       TOKEN_TYPE_VALUE)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryInstant))
                .signWith(secretKey)
                .compact();
    }

    //  Parse & Validate

    @Override
    public QrClaims parseAndValidate(String jwt) {
        if (jwt == null || jwt.isBlank()) {
            throw new QrTokenInvalidException("QR token is empty");
        }

        Claims claims = extractClaims(jwt);          // throws on bad sig / expired
        validateTokenType(claims);                   // must be MEAL_TOKEN
        return mapToClaims(claims);
    }

    //  Private helpers

    private Claims extractClaims(String jwt) {
        try {
            return Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) secretKey)
                    .build()
                    .parseSignedClaims(jwt)
                    .getPayload();

        } catch (ExpiredJwtException ex) {
            logger.warn("QR token expired: {}", ex.getMessage());
            throw new QrTokenExpiredException("QR code has expired");

        } catch (JwtException ex) {
            logger.warn("QR token invalid signature or structure: {}", ex.getMessage());
            throw new QrTokenInvalidException("QR code signature is invalid");
        }
    }

    private void validateTokenType(Claims claims) {
        String type = claims.get(CLAIM_TYPE, String.class);
        if (!TOKEN_TYPE_VALUE.equals(type)) {
            throw new QrTokenInvalidException("Not a meal token QR");
        }
    }

    private QrClaims mapToClaims(Claims claims) {
        try {
            return new QrClaims(
                    UUID.fromString(claims.get(CLAIM_TOKEN_ID, String.class)),
                    UUID.fromString(claims.get(CLAIM_STUDENT_ID, String.class)),
                    claims.get(CLAIM_HALL, String.class),
                    LocalDate.parse(claims.get(CLAIM_MEAL_DATE, String.class)),
                    MealType.valueOf(claims.get(CLAIM_MEAL_TYPE, String.class))
            );
        } catch (Exception ex) {
            logger.error("Failed to map QR claims: {}", ex.getMessage());
            throw new QrTokenInvalidException("QR token payload is malformed");
        }
    }
}