package com.mbstu.diningpass.meal.config.redis;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Dedicated ObjectMapper for Redis only — isolated from Spring MVC's ObjectMapper.
     *
     * WHY EVERYTHING:
     *   - Your DTOs are Java records, which are implicitly final.
     *   - NON_FINAL skips type info for final types → deserialization returns
     *     LinkedHashMap instead of the actual record → ClassCastException at runtime.
     *   - EVERYTHING embeds @class for ALL types including final records,
     *     so JacksonRedisSerializer.deserialize(bytes, Object.class) works correctly.
     *   - EVERYTHING is deprecated in Jackson 2.x but NOT removed — it is safe
     *     to use with Spring Boot 3.x (Jackson 2.x) until Jackson 3.x arrives.
     */
    @Bean
    @SuppressWarnings("deprecation")
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Registers JavaTimeModule (LocalDate, LocalTime, LocalDateTime),
        // ParameterNamesModule (required for records — no-arg constructor reflection),
        // and all other available Jackson modules automatically.
        mapper.findAndRegisterModules();

        // Store dates as "2026-05-14", not as numeric timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Embeds {"@class":"com.mbstu....MyRecord", ...} for every serialized object.
        // Required because JacksonRedisSerializer.deserialize() reads as Object.class
        // and needs the type hint to reconstruct the correct type.
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING, // handles final records correctly
                JsonTypeInfo.As.PROPERTY               // {"@class":"...", "field":"value"}
        );

        return mapper;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {

        JacksonRedisSerializer serializer = new JacksonRedisSerializer(redisObjectMapper);
        RedisSerializationContext.SerializationPair<String> keySerializer = RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer());
        RedisSerializationContext.SerializationPair<Object> valueSerializer = RedisSerializationContext.SerializationPair.fromSerializer(serializer);

        // Base config — all named caches inherit from this unless overridden below
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .prefixCacheNameWith("diningpass:meal:v1:")  // Redis key = "diningpass:meal:v1:mealConfigs::arg"
                .serializeKeysWith(keySerializer)
                .serializeValuesWith(valueSerializer);

        // Per-cache TTL overrides — inherits serializer and prefix from defaultConfig
        Map<String, RedisCacheConfiguration> perCacheConfig = new HashMap<>();

        perCacheConfig.put("mealConfigs", defaultConfig.entryTtl(Duration.ofMinutes(2)));   // changes frequently
        perCacheConfig.put("mealTokens", defaultConfig.entryTtl(Duration.ofMinutes(10)));   // stable after approval
        perCacheConfig.put("payments", defaultConfig.entryTtl(Duration.ofMinutes(10)));     // stable after approval
        perCacheConfig.put("hallProfiles", defaultConfig.entryTtl(Duration.ofSeconds(30)));
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(perCacheConfig)
                .build();
    }
}