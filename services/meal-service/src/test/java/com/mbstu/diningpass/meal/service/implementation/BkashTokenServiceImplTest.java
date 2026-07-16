package com.mbstu.diningpass.meal.service.implementation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mbstu.diningpass.meal.config.payment.BkashProperties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BkashTokenServiceImplTest {

    @Mock private RestTemplate restTemplate;
    @Mock private BkashProperties bkashProperties;

    // Real ObjectMapper — cheap and avoids over-mocking simple serialization.
    private final ObjectMapper objectMapper = new ObjectMapper();

    private BkashTokenServiceImpl bkashTokenService;

    @BeforeEach
    void setUp() {
        bkashTokenService = new BkashTokenServiceImpl(restTemplate, bkashProperties, objectMapper);

        lenient().when(bkashProperties.getApiKey()).thenReturn("api-key");
        lenient().when(bkashProperties.getSecretKey()).thenReturn("secret-key");
        lenient().when(bkashProperties.getUsername()).thenReturn("username");
        lenient().when(bkashProperties.getPassword()).thenReturn("password");
        lenient().when(bkashProperties.getGrantTokenUrl()).thenReturn("https://bkash.test/grant");
        lenient().when(bkashProperties.getRefreshTokenUrl()).thenReturn("https://bkash.test/refresh");
    }

    @Test
    @DisplayName("getValidToken performs a full grant when no token has been fetched yet")
    void performsGrantWhenNoTokenYet() {
        Map<String, Object> grantResponse = Map.of(
                "id_token", "id-token-1",
                "refresh_token", "refresh-token-1",
                "expires_in", "3600"
        );
        //noinspection unchecked,rawtypes
        when(restTemplate.exchange(eq("https://bkash.test/grant"), eq(HttpMethod.POST),
                any(HttpEntity.class), eq(Map.class)))
                .thenReturn((ResponseEntity) ResponseEntity.ok(grantResponse));

        String token = bkashTokenService.getValidToken();

        assertThat(token).isEqualTo("id-token-1");
        verify(restTemplate).exchange(eq("https://bkash.test/grant"), eq(HttpMethod.POST),
                any(HttpEntity.class), eq(Map.class));
    }

    @Test
    @DisplayName("getValidToken reuses the cached token while it has not expired")
    void reusesCachedTokenWhileValid() {
        Map<String, Object> grantResponse = Map.of(
                "id_token", "id-token-1",
                "refresh_token", "refresh-token-1",
                "expires_in", "3600"
        );
        //noinspection unchecked,rawtypes
        when(restTemplate.exchange(eq("https://bkash.test/grant"), eq(HttpMethod.POST),
                any(HttpEntity.class), eq(Map.class)))
                .thenReturn((ResponseEntity) ResponseEntity.ok(grantResponse));

        String first = bkashTokenService.getValidToken();
        String second = bkashTokenService.getValidToken();

        assertThat(first).isEqualTo(second);
        // Only ONE network call should have happened — second call served from cache
        verify(restTemplate, times(1)).exchange(anyString(), eq(HttpMethod.POST),
                any(HttpEntity.class), eq(Map.class));
    }

    @Test
    @DisplayName("refreshToken throws IllegalStateException when no refresh token is available")
    void refreshTokenThrowsWhenNoneAvailable() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class,
                () -> bkashTokenService.refreshToken());
    }

    @Test
    @DisplayName("grantToken stores tokens from a successful bKash grant response")
    void grantTokenStoresTokens() {
        Map<String, Object> grantResponse = Map.of(
                "id_token", "brand-new-token",
                "refresh_token", "brand-new-refresh",
                "expires_in", "3500"
        );
        //noinspection unchecked,rawtypes
        when(restTemplate.exchange(eq("https://bkash.test/grant"), eq(HttpMethod.POST),
                any(HttpEntity.class), eq(Map.class)))
                .thenReturn((ResponseEntity) ResponseEntity.ok(grantResponse));

        String token = bkashTokenService.grantToken();

        assertThat(token).isEqualTo("brand-new-token");
    }
}
