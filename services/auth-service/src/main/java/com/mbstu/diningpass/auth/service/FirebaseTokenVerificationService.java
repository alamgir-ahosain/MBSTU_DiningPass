package com.mbstu.diningpass.auth.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/*
  FirebaseTokenVerificationService
  ─────────────────────────────────
  Reusable service for Firebase token verification.
  Extracted from api-gateway's GatewayFirebaseFilter for shared use.
 */


@Slf4j
@Service
public class FirebaseTokenVerificationService {

    private final FirebaseAuth firebaseAuth;

    public FirebaseTokenVerificationService(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    /**
     * Verifies a Firebase ID token and returns the decoded token.
     * 
     * @param idToken the Firebase ID token string (without "Bearer " prefix)
     * @return the decoded FirebaseToken with claims
     * @throws FirebaseAuthException if verification fails
     */
    public FirebaseToken verifyToken(String idToken) throws FirebaseAuthException {
        log.debug("Verifying Firebase ID token");
        return firebaseAuth.verifyIdToken(idToken);
    }



    /**
     * Extracts a claim value as a string from the Firebase token.
     * 
     * @param token the decoded Firebase token
     * @param claimKey the claim key to extract
     * @return the claim value as string, or null if not present
     */
    public String getClaimAsString(FirebaseToken token, String claimKey) {
        Object value = token.getClaims().get(claimKey);
        return value != null ? value.toString() : null;
    }


    /**
     * Extracts custom claims from the Firebase token.
     * 
     * Custom claims set by auth-service during registration:
     *   - dbId: the Student/Admin UUID from your database
     *   - role: STUDENT | HALL_ADMIN | SUPER_ADMIN | COUNTER_STAFF
     * 
     * @param token the decoded Firebase token
     * @return a FirebaseTokenClaims object with extracted values
     */
    public FirebaseTokenClaims extractCustomClaims(FirebaseToken token) {
        String dbId = getClaimAsString(token, "dbId");
        String role = getClaimAsString(token, "role");
        String firebaseUid = token.getUid();

        return new FirebaseTokenClaims(firebaseUid, dbId, role);
    }


    // Record class for Firebase token custom claims.
    public record FirebaseTokenClaims(
            String firebaseUid,
            String dbId,
            String role
    ) {}
}
