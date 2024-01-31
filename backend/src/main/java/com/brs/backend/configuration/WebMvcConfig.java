package com.brs.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig {

    @Value("${host.url}")
    private String hostUrl;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/players**").allowedOrigins(hostUrl);
                registry.addMapping("/encounters**").allowedOrigins(hostUrl);
                registry.addMapping("/swagger-ui**").allowedOrigins(hostUrl);
            }
        };
    }
}
