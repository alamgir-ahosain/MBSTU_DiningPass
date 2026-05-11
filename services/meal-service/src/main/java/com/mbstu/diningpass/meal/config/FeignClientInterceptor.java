package com.mbstu.diningpass.meal.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignClientInterceptor implements RequestInterceptor {

    private final Logger logger = LoggerFactory.getLogger(FeignClientInterceptor.class);
    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            String userId = request.getHeader("X-User-Id");
            String userRole = request.getHeader("X-User-Role");

            if (userId != null)   template.header("X-User-Id", userId);
            if (userRole != null) template.header("X-User-Role", userRole);
            logger.info("FeignClientInterceptor: userId={}, userRole={}", userId, userRole);
        }
        logger.warn("FeignClientInterceptor: template={}", template);
    }
}