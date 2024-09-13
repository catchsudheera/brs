package com.brs.coordinator_backend.config;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Config {
    
    @Autowired
    public EncounterEventListConfig EncounterEventListConfig;
}