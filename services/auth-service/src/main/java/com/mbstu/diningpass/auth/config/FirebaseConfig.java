package com.mbstu.diningpass.auth.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * FirebaseConfig
 * ──────────────
 * Initializes the Firebase Admin SDK on startup.
 *
 * The service account JSON is read from the FIREBASE_SERVICE_ACCOUNT_JSON
 * environment variable — never from a file committed to Git.
 *
 * On Render: set FIREBASE_SERVICE_ACCOUNT_JSON in the dashboard.
 * Locally:   set it in your .env file (paste the entire JSON on one line).
 *
 * This same class is used in BOTH auth-service and api-gateway.
 * Just change the package name when copying to api-gateway.
 *
 * Provides two beans:
 *   1. firebaseApp() — the FirebaseApp instance
 *   2. firebaseAuth() — FirebaseAuth for token verification
 */
@Slf4j
@Configuration
@Profile("!test")
public class FirebaseConfig {

    @Value("${firebase.service-account-json}")
    private String serviceAccountJson;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {

        if (serviceAccountJson == null || serviceAccountJson.isBlank()) {
            throw new IllegalStateException(
                    "Missing Firebase credentials: firebase.service-account-json is empty. " +
                    "Set FIREBASE_SERVICE_ACCOUNT_JSON to a complete Firebase service account JSON string."
            );
        }

        // Guard: avoid "FirebaseApp already exists" on hot reload
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase already initialized — reusing existing FirebaseApp");
            return FirebaseApp.getInstance();
        }

        try (InputStream serviceAccount = new ByteArrayInputStream(serviceAccountJson.trim().getBytes(StandardCharsets.UTF_8))) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp app = FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");
            return app;
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "Invalid Firebase service account JSON. Make sure FIREBASE_SERVICE_ACCOUNT_JSON contains the full JSON object " +
                    "on one line (with escaped \\n in private_key), not a truncated or multiline .env value.",
                    ex
            );
        }
    }

    /**
     * Provides FirebaseAuth instance for token verification.
     * Used by FirebaseTokenVerificationService and AuthServiceFirebaseFilter.
     *
     * Depends on firebaseApp() to ensure FirebaseApp is initialized first.
     *
     * @param firebaseApp the FirebaseApp bean (ensures initialization order)
     * @return FirebaseAuth instance
     */

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance();
    }
}