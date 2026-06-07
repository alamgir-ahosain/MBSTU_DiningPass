package com.mbstu.diningpass.meal.config.payment;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bkash")
@Data
public class BkashProperties {
    private String username;
    private String password;
    private String apiKey;
    private String secretKey;
    private String grantTokenUrl;
    private String refreshTokenUrl;
    private String createPaymentUrl;
    private String executePaymentUrl;
    private String refundUrl;
    private String callbackUrl;
}