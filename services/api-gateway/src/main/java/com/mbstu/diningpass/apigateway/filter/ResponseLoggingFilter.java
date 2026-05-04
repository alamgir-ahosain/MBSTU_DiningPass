package com.mbstu.diningpass.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * ResponseLoggingFilter - Logs response details for debugging
 * ──────────────────────────────────────────────────────────────
 * 
 * Logs the status code and response body for all requests
 * to help diagnose issues with response serialization.
 */
@Slf4j
@Component
public class ResponseLoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpResponse originalResponse = exchange.getResponse();
        
        return chain.filter(exchange).doOnSuccess(aVoid -> {
            log.debug("Response Status: {} for path: {}", originalResponse.getStatusCode(), exchange.getRequest().getURI().getPath());
        }).doOnError(ex -> {
            log.error("Error in response for path: {}", exchange.getRequest().getURI().getPath(), ex);
        });
    }

    @Override
    public int getOrder() {
        return 100;  // Run after other filters
    }
}
