package com.mbstu.diningpass.meal.service.abstraction;

import java.time.Duration;

/**
 * Distributed-lock-style dedupe guard used to prevent the same QR token
 * from being redeemed twice by concurrent scans.
 *
 * Implementations:
 *  - RedisTokenLockService  (Profile "redis")  -> uses Redis SETNX, works across instances
 *  - InMemoryTokenLockService (Profile "!redis") -> single-instance in-memory fallback for local/no-Redis runs
 */
public interface TokenLockService {

    /**
     * Attempts to atomically claim {@code key} for {@code ttl}.
     *
     * @return true if this call claimed the key (i.e. is the first to claim it),
     *         false if it was already claimed by a previous call within the TTL window.
     */
    boolean tryClaim(String key, Duration ttl);
}