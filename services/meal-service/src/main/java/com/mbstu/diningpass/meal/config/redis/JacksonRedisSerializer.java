package com.mbstu.diningpass.meal.config.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

public class JacksonRedisSerializer implements RedisSerializer<Object> {

    private final ObjectMapper objectMapper;

    public JacksonRedisSerializer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public byte[] serialize(Object value) throws SerializationException {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsBytes(value);
        } catch (Exception e) {
            throw new SerializationException("Redis serialization failed for: "
                    + (value.getClass().getSimpleName()), e);
        }
    }

    @Override
    public Object deserialize(byte[] bytes) throws SerializationException {
        if (bytes == null || bytes.length == 0) return null;
        try {
            // Relies on @class embedded by EVERYTHING typing in RedisConfig
            return objectMapper.readValue(bytes, Object.class);
        } catch (Exception e) {
            throw new SerializationException("Redis deserialization failed", e);
        }
    }
}