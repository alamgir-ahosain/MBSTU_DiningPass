package com.mbstu.diningpass.meal.service.implementation;


import com.mbstu.diningpass.meal.config.payment.BkashProperties;
import com.mbstu.diningpass.meal.service.abstraction.BkashTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import java.time.Instant;


@Service
@RequiredArgsConstructor
public class BkashTokenServiceImpl implements BkashTokenService {


    Logger logger=LoggerFactory.getLogger(BkashTokenServiceImpl.class);
    private final RestTemplate restTemplate;
    private final BkashProperties bkashProperties;
    private final ObjectMapper objectMapper;

    private String idToken;
    private String refreshToken;    // stored from Grant or Refresh response
    private Instant tokenExpiry;

    // ── Called before every bKash API call ──────────────────────────
    @Override
    public synchronized String getValidToken() {
        if (idToken == null || Instant.now().isAfter(tokenExpiry)) {
            // Use refreshToken if available, else do a full grant
            if (refreshToken != null) {
                try {
                    return refreshToken();
                } catch (Exception e) {
                    // Refresh failed — fall back to full grant
                    logger.warn("Refresh token failed, falling back to grant: {}", e.getMessage());
                }
            }
            return grantToken();
        }
        return idToken;
    }



    // ── Full authentication — called on first use or after refresh fails ─
    @Override
    public String grantToken() {
        HttpHeaders headers = buildAuthHeaders();

        Map<String, String> body = Map.of(
                "app_key",    clean(bkashProperties.getApiKey()),
                "app_secret", clean(bkashProperties.getSecretKey())
        );
        @SuppressWarnings("rawtypes")
        ResponseEntity<Map> resp = restTemplate.exchange(
                bkashProperties.getGrantTokenUrl(),
                HttpMethod.POST,
                new HttpEntity<>(toJson(body), headers),
                Map.class);

        return storeTokens(requireNode(resp.getBody(), "grant token"));
    }



// ── Refresh Token — uses existing refresh_token, avoids re-auth ────
// bKash API: POST /tokenized/checkout/token/refresh
// Headers:   Content-Type, Accept, username, password
// Body:      { app_key, app_secret, refresh_token }
// Response:  { id_token, refresh_token, expires_in, token_type, statusCode }

    @Override
    public String refreshToken() {
    if (refreshToken == null) {
        throw new IllegalStateException("No refresh token available — call grantToken() first");
    }

    HttpHeaders headers = buildAuthHeaders();

    Map<String, String> body = new HashMap<>();
    body.put("app_key",       clean(bkashProperties.getApiKey()));
    body.put("app_secret",    clean(bkashProperties.getSecretKey()));
    body.put("refresh_token", clean(this.refreshToken));

        @SuppressWarnings("rawtypes")
        ResponseEntity<Map> response = restTemplate.exchange(
            bkashProperties.getRefreshTokenUrl(),          // add this URL to BkashProperties
            HttpMethod.POST,
            new HttpEntity<>(toJson(body), headers),
            Map.class);

    @SuppressWarnings("rawtypes")
    Map data = requireNode(response.getBody(), "refresh token");

    // Validate bKash statusCode in response
        assert data != null;
            String statusCode = textValue(data, "statusCode");
    if (statusCode != null && !"0000".equals(statusCode)) {
        throw new RuntimeException("bKash refresh token failed: " + data.get("statusMessage"));
    }

    return storeTokens(data);
}// ── Shared helper: builds username/password headers for bKash auth ──
    private HttpHeaders buildAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept",   "application/json");
        headers.set("username", clean(bkashProperties.getUsername()));
        headers.set("password", clean(bkashProperties.getPassword()));
        return headers;
    }

    private String toJson(Map<String, String> body) {
        try {
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize bKash request body", e);
        }
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith("\"") && trimmed.endsWith("\""))) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    // ── Shared helper: stores id_token + refresh_token + expiry ─────────
    @SuppressWarnings("rawtypes")
    private String storeTokens(Map data) {
        this.idToken      = textValue(data, "id_token");
        this.refreshToken = textValue(data, "refresh_token");
        String expiresIn  = textValue(data, "expires_in");
        long seconds      = expiresIn != null
                ? Long.parseLong(expiresIn) - 100
                : 3500L;  // safe default
        this.tokenExpiry  = Instant.now().plusSeconds(seconds);
        return this.idToken;
    }

    @SuppressWarnings("rawtypes")
    private Map requireNode(Map body, String action) {
        if (body == null) {
            throw new IllegalStateException("bKash " + action + " response body was null");
        }
        return body;
    }

    @SuppressWarnings("rawtypes")
    private String textValue(Map node, String field) {
        Object value = node.get(field);
        return value == null ? null : String.valueOf(value);
    }
}
