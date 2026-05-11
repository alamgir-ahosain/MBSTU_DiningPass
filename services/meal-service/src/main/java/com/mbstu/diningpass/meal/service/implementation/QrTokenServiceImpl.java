package com.mbstu.diningpass.meal.service.implementation;


import com.mbstu.diningpass.meal.entity.MealToken;
import com.mbstu.diningpass.meal.service.abstraction.QrTokenService;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;


@Service
@AllArgsConstructor
public class QrTokenServiceImpl implements QrTokenService {

    private static final Logger logger = LoggerFactory.getLogger(QrTokenServiceImpl.class);
    private final Key secretKey;


    @Override
    public String generateMealQrToken(MealToken token, LocalTime tokenExpires) {


        Instant now = Instant.now();
        ZoneId zone = ZoneId.of("Asia/Dhaka");
        LocalDateTime expiryDateTime = LocalDateTime.of(token.getMealDate(), tokenExpires);
        Instant expiryInstant = expiryDateTime.atZone(zone).toInstant();

        logger.info("Generating QR code for meal token id={}", token.getId());
        return Jwts.builder()
                .claim("tokenId", token.getId().toString())
                .claim("studentId", token.getStudentId().toString())
                .claim("hall", token.getHallShortName())
                .claim("mealDate", token.getMealDate().toString())
                .claim("mealType", token.getMealType().name())
                .claim("type", "MEAL_TOKEN")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryInstant))
                .signWith(secretKey)
                .compact();
    }
}