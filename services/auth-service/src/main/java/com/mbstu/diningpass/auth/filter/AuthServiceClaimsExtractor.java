package com.mbstu.diningpass.auth.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
  AuthServiceClaimsExtractor
  ──────────────────────────
  IMPORTANT: This service ONLY extracts headers set by API Gateway.
  NO path checking, NO token verification.

     * Public paths: No headers from gateway, attributes remain empty
     * Protected paths: Headers present, stored in attributes
     * Invalid tokens: Never reach this service (gateway blocks)
 */

@Slf4j
@Component
public class AuthServiceClaimsExtractor extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Extract authentication headers set by API Gateway
        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");
        String firebaseUid = request.getHeader("X-Firebase-Uid");

        // Store in request attributes if present (gateway authenticated this request)
        if (userId != null) {request.setAttribute("user-id", userId);}
        if (userRole != null) {request.setAttribute("user-role", userRole);}
        if (firebaseUid != null) {request.setAttribute("firebase-uid", firebaseUid);}

        // Continue - let the controller handle authorization rules if needed
        filterChain.doFilter(request, response);
    }
}
