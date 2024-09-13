package com.brs.coordinator_backend.communication.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "encounter-events-config")
public record EncounterEventListConfig(List<EncounterEvent> encounterEvents) {
}
