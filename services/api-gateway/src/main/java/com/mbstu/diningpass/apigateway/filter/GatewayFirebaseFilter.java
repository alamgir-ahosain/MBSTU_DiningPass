package com.mbstu.diningpass.apigateway.filter;


import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Set;

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

    // Only documented public auth endpoint + temporary legacy registration path.
    private static final Set<String> PUBLIC_POST_PATHS = Set.of(
            "/api/v1/students",
            "/api/v1/students/register"
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

        // 2. Skip documented public endpoint(s) only
        if (HttpMethod.POST.matches(method) && PUBLIC_POST_PATHS.contains(path)) {
            log.info(" Skipping public endpoint (no auth required): {} {}", method, path);
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

                    // ── DEBUG: print all claims ──────────────────────────
                    log.info("=== FIREBASE TOKEN CLAIMS ===");
                    log.info("uid        : {}", decoded.getUid());
                    log.info("email      : {}", decoded.getEmail());
                    log.info("all claims : {}", decoded.getClaims());
                    log.info("dbId claim : {}", decoded.getClaims().get("dbId"));
                    log.info("role claim : {}", decoded.getClaims().get("role"));
                    log.info("==============================");
                    // ─────────────────────────────────────────────────────

                    // 4. Extract custom claims (set by auth-service during registration)
                    String dbId   = getClaimAsString(decoded, "dbId");    // your DB UUID
                    String role   = getClaimAsString(decoded, "role");    // STUDENT | HALL_ADMIN | ...

                    if (dbId == null || role == null) {
                        log.warn("Firebase token missing required custom claims (dbId/role). " + "User may have registered before claims were set. uid={}", decoded.getUid());
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }

                    // ── DEBUG: confirm headers being set ────────────────
                    log.info("=== SETTING HEADERS ===");
                    log.info("X-User-Id   : {}", dbId);
                    log.info("X-User-Role : {}", role);
                    log.info("=======================");
                    // ────────────────────────────────────────────────────

                    // 5. Forward as trusted headers — strip any client-supplied values first
                    ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                            .headers(headers -> {
                                headers.remove("X-User-Id");
                                headers.remove("X-User-Role");
                                headers.remove("X-Firebase-Uid");
                                headers.set("X-User-Id", dbId);
                                headers.set("X-User-Role", role);
                                headers.set("X-Firebase-Uid", decoded.getUid());
                            })
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