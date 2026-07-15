package com.mbstu.diningpass.meal.service.implementation;

import com.mbstu.diningpass.meal.service.abstraction.TokenLockService;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Single-JVM fallback for {@link TokenLockService} used when no Redis instance
 * is configured (local dev / "!redis" profile). Not safe across multiple
 * app instances — fine for local/dev, but the "redis" profile should be used
 * in any horizontally-scaled or production deployment.
 */
@Service
@Profile("!redis")
public class InMemoryTokenLockService implements TokenLockService {

    private final Map<String, Instant> claims = new ConcurrentHashMap<>();

    @Override
    public boolean tryClaim(String key, Duration ttl) {
        Instant now = Instant.now();
        Instant expiry = now.plus(ttl);

        Instant existing = claims.putIfAbsent(key, expiry);
        if (existing == null) {
            return true; // first to claim
        }
        if (existing.isBefore(now)) {
            // stale claim (past TTL) — try to take over the slot
            return claims.replace(key, existing, expiry);
        }
        return false; // already claimed and still within TTL
    }

    // Periodic sweep so this map doesn't grow unbounded over a long-running dev session.
    @Scheduled(fixedRate = 30 * 60 * 1000) // every 30 minutes
    void evictExpired() {
        Instant now = Instant.now();
        claims.entrySet().removeIf(e -> e.getValue().isBefore(now));
    }
}