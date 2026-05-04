package com.mbstu.diningpass.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * CorsHeaderFilter - Adds CORS headers to all responses
 * ──────────────────────────────────────────────────────
 * Uses a response decorator to add CORS headers AFTER the response is prepared
 * by the downstream service, ensuring headers are always present.
 * For OPTIONS (preflight) requests: responds immediately with 200 OK + CORS headers
 * For other requests: decorates response and adds CORS headers before writing to client
 */


@Slf4j
@Component
public class CorsHeaderFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(@NonNull ServerWebExchange exchange, @NonNull GatewayFilterChain chain) {
        String origin = exchange.getRequest().getHeaders().getOrigin();
        String method = String.valueOf(exchange.getRequest().getMethod());
        String path = exchange.getRequest().getURI().getPath();

        log.info(" CorsHeaderFilter: method={}, path={}, origin={}", method, path, origin);

        // Only process if origin matches allowed list
        if (origin == null || !isAllowedOrigin(origin)) {
            log.warn(" Origin not allowed or null: {}", origin);
            return chain.filter(exchange);
        }

        log.info(" CORS: Processing {} request from origin: {}", method, origin);

        // For OPTIONS (preflight) requests, respond immediately with 200 OK
        if ("OPTIONS".equalsIgnoreCase(method)) {
            log.info("📌 OPTIONS preflight request detected, responding with 200 OK");
            addCorsHeaders(exchange.getResponse(), origin);
            exchange.getResponse().setStatusCode(HttpStatus.OK);
            log.info(" CORS headers added to preflight response");
            return exchange.getResponse().setComplete();
        }

        // For other requests, decorate the response to add headers
        log.info("🔗 Decorating response for {} {}", method, path);
        ServerHttpResponse originalResponse = exchange.getResponse();
        ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
            @Override
            public @NonNull HttpHeaders getHeaders() {
                // Obtain the headers once from the super implementation and modify that
                // instance. Do NOT call response.getHeaders() inside addCorsHeaders with
                // this decorator, because that would re-enter this method and cause
                // a StackOverflowError.
                HttpHeaders headers = super.getHeaders();
                log.info("📝 Adding CORS headers to response for: {}", path);
                addCorsHeaders(headers, origin);
                return headers;
            }
        };

        // Replace response with decorated version and continue
        return chain.filter(exchange.mutate().response(decoratedResponse).build());
    }

    /**
     * Check if origin is in allowed list
     */
    private boolean isAllowedOrigin(String origin) {
        boolean allowed = origin != null && (
                origin.equals("http://localhost:5173") ||
                origin.equals("http://localhost:3000") ||
                origin.equals("http://127.0.0.1:5173") ||
                origin.startsWith("http://localhost:") ||
                origin.startsWith("http://127.0.0.1:")
        );
        log.info(" Checking origin: {} → Allowed: {}", origin, allowed);
        return allowed;
    }

    /**
     * Add CORS headers to the response
     */
    private void addCorsHeaders(ServerHttpResponse response, String origin) {
        // For non-decorated responses (preflight path) it's safe to call response.getHeaders()
        // because it will not re-enter the decorator's getHeaders().
        addCorsHeaders(response.getHeaders(), origin);
    }

    /**
     * Set CORS headers directly on an HttpHeaders instance.
     * Use this from the response decorator to avoid recursive getHeaders() calls.
     */
    private void addCorsHeaders(HttpHeaders headers, String origin) {
        log.info("🛠️  Setting CORS headers for origin: {}", origin);

        // Use set() to avoid duplicates (replaces if exists)
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-User-Id, X-User-Role, X-Firebase-Uid, Access-Control-Request-Headers, Access-Control-Request-Method");
        headers.set("Access-Control-Expose-Headers", "Content-Type, Authorization, X-Total-Count, Content-Disposition");
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Max-Age", "600");
        headers.set("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");

        log.info(" CORS headers set successfully:");
        log.info("   - Access-Control-Allow-Origin: {}", headers.getFirst("Access-Control-Allow-Origin"));
        log.info("   - Access-Control-Allow-Methods: {}", headers.getFirst("Access-Control-Allow-Methods"));
        log.info("   - Access-Control-Expose-Headers: {}", headers.getFirst("Access-Control-Expose-Headers"));
    }

    @Override
    public int getOrder() {
        // Run VERY early, before other filters (including Firebase filter)
        return -2147483648;  // Integer.MIN_VALUE ensures it runs first
    }
}
