package com.brs.coordinator_backend.config;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class Config {
    
    @Autowired
    public EncounterEventListConfig EncounterEventListConfig;


    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}