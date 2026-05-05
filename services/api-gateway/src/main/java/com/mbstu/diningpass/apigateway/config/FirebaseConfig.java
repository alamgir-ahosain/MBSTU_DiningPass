package com.mbstu.diningpass.apigateway.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;

/**
 * Firebase Admin SDK Configuration
 * ────────────────────────────────
 *
 * Initializes Firebase Admin SDK using service account credentials.
 * The service account JSON is loaded from environment variable:
 *   FIREBASE_SERVICE_ACCOUNT_JSON
 *
 * This bean provides FirebaseAuth which is used by GatewayFirebaseFilter
 * to verify ID tokens sent by the mobile/web client.
 *
 *  Important:
 *   - Download Firebase service account JSON from:
 *     Firebase Console > Project Settings > Service Accounts > Generate New Private Key
 *   - Store in .env file: FIREBASE_SERVICE_ACCOUNT_JSON={full JSON}
 */


@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-json}")
    private String firebaseServiceAccountJson;

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        // Initialize only once
        if (FirebaseApp.getApps().isEmpty()) {
            log.info("Initializing Firebase Admin SDK...");

            try {
                // Convert JSON string to stream
                ByteArrayInputStream serviceAccountStream = new ByteArrayInputStream(firebaseServiceAccountJson.getBytes());

                // Load credentials from stream
                GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccountStream);

                // Build Firebase options
                FirebaseOptions options = FirebaseOptions.builder().setCredentials(credentials).build();

                // Initialize Firebase app
                FirebaseApp.initializeApp(options);
                log.info(" Firebase Admin SDK initialized successfully");

            } catch (IOException e) {
                log.error(" Failed to initialize Firebase Admin SDK", e);
                throw e;
            }
        } else {
            log.info("Firebase Admin SDK already initialized");
        }

        // Return FirebaseAuth instance
        return FirebaseAuth.getInstance();
    }
}