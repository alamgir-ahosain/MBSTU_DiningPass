package com.mbstu.diningpass.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Cloud Gateway Route Configuration
 * ─────────────────────────────────────────
 *
 * Defines routing rules to forward requests to downstream microservices
 * based on path patterns. Each route specifies:
 *   - Path predicate: which URLs match this route
 *   - URI: the backend service URL
 *   - Filters: transformations (strip prefix, etc.)
 *
 * Routes (local development):
 *   /api/v1/students/** → http://localhost:8081 (auth-service)
 *   /api/v1/users/**    → http://localhost:8082 (user-service)
 *   /api/v1/halls/**    → http://localhost:8081 (auth-service)
 */
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                // Auth Service routes
                .route("auth-service-students", r -> r
                        .path("/api/v1/students/**")
                        .uri("http://localhost:8081"))

                .route("auth-service-halls", r -> r
                        .path("/api/v1/halls/**")
                        .uri("http://localhost:8081"))

                .route("auth-service-admins", r -> r
                        .path("/api/v1/admin/accounts/**")
                        .uri("http://localhost:8081"))

                .build();
    }
}
