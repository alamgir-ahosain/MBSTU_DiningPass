package com.mbstu.diningpass.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * SecurityConfig - Security Configuration for API Gateway
 * ────────────────────────────────────────────────────────
 *
 * Configures:
 *   1. Disable CSRF (stateless API with JWT)
 *   2. Disable HTTP Basic auth (using Firebase JWT instead)
 *   3. Allow all requests (authentication done by GatewayFirebaseFilter)
 */

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    /**
     * Configure Spring Security for WebFlux
     * ────────────────────────────────────
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                // Disable CSRF (stateless API with JWT)
                .csrf(csrf -> csrf.disable())
                
                // Keep CORS enabled so preflight requests are handled consistently.
                .cors(Customizer.withDefaults())

                // Allow all requests — authentication is done in GatewayFirebaseFilter
                .authorizeExchange(authz -> authz.anyExchange().permitAll())
                
                // Disable HTTP Basic (we use Firebase JWT instead)
                .httpBasic(basic -> basic.disable());
        
        return http.build();
    }
}
