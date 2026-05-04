package com.mbstu.diningpass.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173"
        ));
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS",
                "HEAD"
        ));
        configuration.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Cache-Control",
                "Pragma",
                "X-User-Id",
                "X-User-Role",
                "X-Firebase-Uid"
        ));
        configuration.setExposedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "X-Total-Count",
                "Content-Disposition"
        ));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return new CorsWebFilter(source);
    }
}


