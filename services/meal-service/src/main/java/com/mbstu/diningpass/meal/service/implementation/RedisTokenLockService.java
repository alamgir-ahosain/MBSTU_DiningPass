package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.service.abstraction.TokenLockService;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Profile("redis")
@AllArgsConstructor
public class RedisTokenLockService implements TokenLockService {

    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public boolean tryClaim(String key, Duration ttl) {
        Boolean claimed = redisTemplate.opsForValue().setIfAbsent(key, "USED", ttl);
        return Boolean.TRUE.equals(claimed);
    }
}