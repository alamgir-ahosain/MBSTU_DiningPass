package com.mbstu.diningpass.auth.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * FirebaseAuthenticationUtil
 * ──────────────────────────
 * 
 * Utility class for extracting Firebase authentication information
 * from HTTP requests. Supports both:
 *   1. Headers set by API Gateway (X-User-Id, X-User-Role, etc.)
 *   2. Request attributes set by AuthServiceFirebaseFilter
 * 
 * Usage in controllers:
 *   UUID userId = authUtil.extractUserIdFromRequest(request);
 *   String role = authUtil.extractRoleFromRequest(request);
 */
@Component
public class FirebaseAuthenticationUtil {

    /**
     * Extracts the user ID (database UUID) from the request.
     * Checks multiple sources (headers and attributes) for flexibility.
     * 
     * @param request the HTTP request
     * @return the user ID as UUID, or null if not found
     */
    public UUID extractUserIdFromRequest(HttpServletRequest request) {
        // First, try request attribute (set by AuthServiceFirebaseFilter)
        Object attrUserId = request.getAttribute("user-id");
        if (attrUserId instanceof String) {
            try {
                return UUID.fromString((String) attrUserId);
            } catch (IllegalArgumentException e) {
                // Invalid UUID format, continue to next source
            }
        }

        // Then, try header (set by API Gateway)
        String headerUserId = request.getHeader("X-User-Id");
        if (headerUserId != null) {
            try {
                return UUID.fromString(headerUserId);
            } catch (IllegalArgumentException e) {
                // Invalid UUID format, return null
            }
        }

        return null;
    }

    /**
     * Extracts the Firebase UID from the request.
     * 
     * @param request the HTTP request
     * @return the Firebase UID, or null if not found
     */
    public String extractFirebaseUidFromRequest(HttpServletRequest request) {
        // First, try request attribute (set by AuthServiceFirebaseFilter)
        Object attrFirebaseUid = request.getAttribute("firebase-uid");
        if (attrFirebaseUid instanceof String) {
            return (String) attrFirebaseUid;
        }

        // Then, try header (set by API Gateway)
        return request.getHeader("X-Firebase-Uid");
    }

    /**
     * Extracts the user role from the request.
     * 
     * @param request the HTTP request
     * @return the user role, or null if not found
     */
    public String extractRoleFromRequest(HttpServletRequest request) {
        // First, try request attribute (set by AuthServiceFirebaseFilter)
        Object attrRole = request.getAttribute("user-role");
        if (attrRole instanceof String) {
            return (String) attrRole;
        }

        // Then, try header (set by API Gateway)
        return request.getHeader("X-User-Role");
    }

    /**
     * Checks if a role matches or exceeds a required level.
     * Used for fine-grained authorization.
     * 
     * Hierarchy: SUPER_ADMIN > HALL_ADMIN > COUNTER_STAFF > STUDENT
     * 
     * @param actualRole the user's actual role
     * @param requiredRole the minimum required role
     * @return true if actualRole meets or exceeds requiredRole
     */
    public boolean hasRequiredRole(String actualRole, String requiredRole) {
        if (actualRole == null || requiredRole == null) {
            return false;
        }

        return switch (requiredRole) {
            case "SUPER_ADMIN" -> actualRole.equals("SUPER_ADMIN");
            case "HALL_ADMIN" -> actualRole.equals("SUPER_ADMIN") || actualRole.equals("HALL_ADMIN");
            case "COUNTER_STAFF" -> actualRole.equals("SUPER_ADMIN") || 
                                   actualRole.equals("HALL_ADMIN") || 
                                   actualRole.equals("COUNTER_STAFF");
            case "STUDENT" -> true; // All users are at least STUDENT
            default -> false;
        };
    }
}
