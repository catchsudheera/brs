package com.brs.coordinator_backend.controllers;

import com.brs.coordinator_backend.service.EncounterScheduleEventProcessingService;
import com.brs.coordinator_backend.service.EncounterScheduleProcessingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class TestController {

    @Autowired private EncounterScheduleProcessingService encounterScheduleProcessingService;

    @Autowired
    private EncounterScheduleEventProcessingService encounterScheduleEventProcessingService;

    @GetMapping(value = "/test/encounter/schedule")
    public void testEncounterSchdule() {
        encounterScheduleProcessingService.processEventSchedules();
    }

    @GetMapping(value = "/test/encounter/event")
    public void testEncounterEventSchduler() {
        encounterScheduleEventProcessingService.processEventSchedules();
    }
}
