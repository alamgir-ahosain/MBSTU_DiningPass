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
 *   /api/v1/halls/**    → http://localhost:8081 (auth-service)
 *   /api/v1/admins/**   → http://localhost:8081 (auth-service)
 *
 * Legacy compatibility routes:
 *   /api/v1/students/register -> /api/v1/students
 *   /api/v1/students/profile  -> /api/v1/students/me
 */
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()


                // _______________ Auth Service routes _________________-

                .route("auth-service-students", r -> r
                        .path("/api/v1/students", "/api/v1/students/**")
                        .uri("http://localhost:8081"))

                .route("auth-service-students-register-legacy", r -> r
                        .path("/api/v1/students/register")
                        .filters(f -> f.setPath("/api/v1/students"))
                        .uri("http://localhost:8081"))

                .route("auth-service-students-profile-legacy", r -> r
                        .path("/api/v1/students/profile")
                        .filters(f -> f.setPath("/api/v1/students/me"))
                        .uri("http://localhost:8081"))

                .route("auth-service-halls", r -> r
                        .path("/api/v1/halls", "/api/v1/halls/**")
                        .uri("http://localhost:8081"))

                .route("auth-service-admins", r -> r
                        .path("/api/v1/admins", "/api/v1/admins/**")
                        .uri("http://localhost:8081"))


                // _______________ Meal Service routes ___________________-

                .route("meal-service-configs", r -> r
                        .path("/api/v1/meal-configs", "/api/v1/meal-configs/**")
                        .uri("http://localhost:8082"))

                .route("meal-service-tokens", r -> r
                        .path("/api/v1/meal-tokens", "/api/v1/meal-tokens/**")
                        .uri("http://localhost:8082"))

                .route("meal-service-payments", r -> r
                        .path("/api/v1/payments", "/api/v1/payments/**")
                        .uri("http://localhost:8082"))

                .route("meal-service-bkash-payments", r -> r
                        .path("/api/payment/bkash", "/api/payment/bkash/**")
                        .uri("http://localhost:8082"))

                .route("meal-service-summary", r -> r
                        .path("/api/v1/summary", "/api/v1/summary/**")
                        .uri("http://localhost:8082"))

                .build();
    }
}
