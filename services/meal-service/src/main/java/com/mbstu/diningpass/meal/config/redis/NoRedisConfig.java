package com.mbstu.diningpass.meal.config.redis;


import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Fallback cache manager when "redis" profile is NOT active (local dev / no-Redis runs).
 * Plain in-memory ConcurrentHashMap-backed cache ? no TTL, no expiration,
 * entries live until evicted by @CacheEvict or the app restarts.
 *
 * Cache names here MUST match the "value" used in @Cacheable/@CacheEvict
 * annotations across the service, or those annotations will throw
 * "Cannot find cache named 'X'" at runtime.
 */

@Configuration
@Profile("!redis")
public class NoRedisConfig {

    @Bean
    public CacheManager simpleCacheManager() {
        return new ConcurrentMapCacheManager(
                "mealConfigs", "mealTokens", "payments", "hallProfiles"
        );
    }
}
