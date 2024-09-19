package com.brs.coordinator_backend.event;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.dto.EncounterEventScheduleStatus;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.model.Event;
import com.brs.coordinator_backend.repositories.EncountersSchedulesRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CompleteEventEncounterEventProcessor extends AbstractEventProcessor {

    private final EncountersSchedulesRepository encountersSchedulesRepository;

    @Autowired
    protected CompleteEventEncounterEventProcessor(
            EncounterEventListConfig encounterEventListConfig,
            EncountersSchedulesRepository encountersSchedulesRepository) {
        super(encounterEventListConfig);
        this.encountersSchedulesRepository = encountersSchedulesRepository;
    }

    @Override
    public EventType getEventType() {
        return EventType.COMPLTE_EVENT_ENCOUNTER;
    }

    @Override
    public LocalDateTime getExpectedExecutionDateTime(LocalDate date) {
        return date.plusDays(1).atTime(00, 0);
    }

    @Override
    public void doAction(Event event) {
        var encounterSchedule = event.getEncountersSchedule();
        encounterSchedule.setEncounterEventScheduleStatus(EncounterEventScheduleStatus.COMPLETED);
        encountersSchedulesRepository.save(encounterSchedule);
    }
}
