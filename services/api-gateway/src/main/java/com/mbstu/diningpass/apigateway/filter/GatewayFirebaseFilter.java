package com.mbstu.diningpass.apigateway.filter;


import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;

/**
 * GatewayFirebaseFilter
 * ─────────────────────
 * Verifies Firebase ID Tokens on incoming requests to the API Gateway.
 *
 * Flow:
 *   1. Skip OPTIONS requests (browser preflight) — handled by CORS filter
 *   2. Skip public paths (no token required)
 *   3. Extract Bearer token from Authorization header
 *   4. Call FirebaseAuth.verifyIdToken() — validates with Google's public keys
 *   5. Extract custom claims (dbId, role, hallId) set during registration
 *   6. Forward as trusted headers to downstream services:
 *        X-User-Id    → Student/Admin UUID from your DB (from custom claim "dbId")
 *        X-User-Role  → STUDENT | HALL_ADMIN | SUPER_ADMIN | COUNTER_STAFF
 *        X-Firebase-Uid → raw Firebase UID (rarely needed downstream)
 *
 * Downstream services (auth, meal, payment, user) read these headers
 * exactly as before — zero changes needed in business logic.
 *
 * Important: FirebaseAuth.verifyIdToken() is a blocking call.
 * We offload it to boundedElastic() so the reactive event loop is not blocked.
 */


@Component
public class GatewayFirebaseFilter implements GlobalFilter, Ordered {

    private  static final Logger log= LoggerFactory.getLogger(GatewayFirebaseFilter.class);

    // ── Paths that skip token verification ───────────────────────────────
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/students/register",      // Student registration
            "/api/v1/halls"                   // Hall dropdown on registration page
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        String method = String.valueOf(exchange.getRequest().getMethod());

        log.info(" GatewayFirebaseFilter: method={}, path={}", method, path);

        // 1. Skip OPTIONS requests (browser preflight) — handled by CORS filter
        if ("OPTIONS".equalsIgnoreCase(method)) {
            log.debug(" Skipping OPTIONS (preflight) request");
            return chain.filter(exchange);
        }

        // 2. Skip public paths
        if (PUBLIC_PATHS.stream().anyMatch(path::startsWith)) {
            log.info(" Skipping public path (no auth required): {}", path);
            return chain.filter(exchange);
        }

        // 3. Extract token
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn(" Missing or malformed Authorization header for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        log.info(" Token found, verifying with Firebase...");
        String idToken = authHeader.substring(7);

        // 3. Verify token — offload blocking Firebase call to boundedElastic thread pool
        return Mono.fromCallable(() -> FirebaseAuth.getInstance().verifyIdToken(idToken))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(decoded -> {
                    // 4. Extract custom claims (set by auth-service during registration)
                    String dbId   = getClaimAsString(decoded, "dbId");    // your DB UUID
                    String role   = getClaimAsString(decoded, "role");    // STUDENT | HALL_ADMIN | ...

                    if (dbId == null || role == null) {
                        log.warn("Firebase token missing required custom claims (dbId/role). " + "User may have registered before claims were set. uid={}", decoded.getUid());
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }

                    // 5. Forward as trusted headers — strip any client-supplied values first
                    ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                            .header("X-User-Id",      dbId)
                            .header("X-User-Role",    role)
                            .header("X-Firebase-Uid", decoded.getUid())
                            .build();

                    log.debug("Authenticated request: dbId={}, role={}, path={}", dbId, role, path);

                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                })
                .onErrorResume(FirebaseAuthException.class, ex -> {
                    log.warn("Firebase token verification failed: {} for path: {}", ex.getMessage(), path);
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                })
                .onErrorResume(Exception.class, ex -> {
                    log.error("Unexpected error in Firebase filter: {}", ex.getMessage(), ex);
                    exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
                    return exchange.getResponse().setComplete();
                });
    }

    @Override
    public int getOrder() { return -1; }  // run before all other filters

    // ── Helper ────────────────────────────────────────────────────────────

    private String getClaimAsString(FirebaseToken token, String claimKey) {
        Object value = token.getClaims().get(claimKey);
        return value != null ? value.toString() : null;
    }
}