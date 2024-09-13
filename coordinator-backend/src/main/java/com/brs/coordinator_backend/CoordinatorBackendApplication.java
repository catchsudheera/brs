package com.brs.coordinator_backend;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(EncounterEventListConfig.class)
public class CoordinatorBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoordinatorBackendApplication.class, args);
	}

}
