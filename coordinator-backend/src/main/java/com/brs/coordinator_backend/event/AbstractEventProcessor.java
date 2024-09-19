package com.brs.coordinator_backend.event;

import com.brs.coordinator_backend.communication.config.EncounterEvent;
import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.dto.EventStatus;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.model.EncountersSchedule;
import com.brs.coordinator_backend.model.Event;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.jetbrains.annotations.Nullable;

public abstract class AbstractEventProcessor {

    private final EncounterEventListConfig encounterEventListConfig;

    protected AbstractEventProcessor(EncounterEventListConfig encounterEventListConfig) {
        this.encounterEventListConfig = encounterEventListConfig;
    }

    public abstract EventType getEventType();

    public abstract LocalDateTime getExpectedExecutionDateTime(LocalDate date);

    public abstract void doAction(Event event);

    public Event buildEvents(EncountersSchedule encountersSchedule) {
        return Event.builder()
                .encountersSchedule(encountersSchedule)
                .eventType(getEventType())
                .eventStatus(EventStatus.PENDING)
                .expectedExecutionTime(
                        getExpectedExecutionDateTime(encountersSchedule.getEncounterScheduleDate()))
                .build();
    }

    protected @Nullable EncounterEvent getEncounterEvent(EncountersSchedule encounterSchedule) {
        var encounterEvent =
                encounterEventListConfig.encounterEvents().stream()
                        .filter(e -> e.name().equals(encounterSchedule.getEncounterEvent()))
                        .findFirst()
                        .orElse(null);
        return encounterEvent;
    }
}
