package com.mbstu.diningpass.meal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * App-wide default ObjectMapper (always active, no @Profile).
 * Needed because RedisConfig's ObjectMapper is @Profile("redis") only ?
 * without this, beans like BkashTokenServiceImpl fail to start when
 * running without the redis profile (no ObjectMapper bean available).
 *
 * Kept deliberately plain (no polymorphic @class typing) since this is
 * used for normal JSON (e.g. bKash API calls) ? unlike redisObjectMapper,
 * which needs type-embedding just for cache serialization.
 *
 * @Primary resolves ambiguity when both this and redisObjectMapper exist.
 */
@Configuration
public class ObjectMapperConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules(); // JavaTimeModule, ParameterNamesModule (for records), etc.
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
