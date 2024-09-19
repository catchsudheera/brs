package com.brs.coordinator_backend;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(EncounterEventListConfig.class)
@EnableScheduling
public class CoordinatorBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoordinatorBackendApplication.class, args);
    }
}
