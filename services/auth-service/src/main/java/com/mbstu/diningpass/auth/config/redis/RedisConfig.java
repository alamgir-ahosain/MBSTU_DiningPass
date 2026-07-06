package com.mbstu.diningpass.auth.config.redis;


import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@Profile("redis")
public class RedisConfig {

//    @Bean
//    public ObjectMapper redisObjectMapper() {
//        ObjectMapper mapper = new ObjectMapper();
//        mapper.registerModule(new JavaTimeModule());
//        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
//        // Embeds @class field in JSON so any DTO deserializes correctly
//        mapper.activateDefaultTyping(
//                LaissezFaireSubTypeValidator.instance,
//                ObjectMapper.DefaultTyping.NON_FINAL,
//                JsonTypeInfo.As.PROPERTY
//        );
//        return mapper;
//    }

    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Automatically finds and registers ALL available Jackson modules —
        // JavaTimeModule, ParameterNamesModule (needed for records/immutable classes), etc.
        mapper.findAndRegisterModules();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {

        JacksonRedisSerializer serializer = new JacksonRedisSerializer(redisObjectMapper);

        // Prefix MUST be set here — perCacheConfig entries inherit from this
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .prefixCacheNameWith("diningpass:auth:v1:")          // ← here
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));

        Map<String, RedisCacheConfiguration> perCacheConfig = new HashMap<>();

        // These inherit the prefix because they're derived from defaultConfig
        perCacheConfig.put("halls", defaultConfig.entryTtl(Duration.ofHours(1)));
        perCacheConfig.put("studentProfile", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        perCacheConfig.put("hallAssociateProfile", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        perCacheConfig.put("hallAssociateList", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        perCacheConfig.put("studentList", defaultConfig.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(perCacheConfig)
                .build();
    }

}