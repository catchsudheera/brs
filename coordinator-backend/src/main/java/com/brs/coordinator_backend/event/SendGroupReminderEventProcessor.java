package com.brs.coordinator_backend.event;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.model.Event;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SendGroupReminderEventProcessor extends AbstractEventProcessor {

    @Autowired
    public SendGroupReminderEventProcessor(EncounterEventListConfig encounterEventListConfig) {
        super(encounterEventListConfig);
    }

    @Override
    public EventType getEventType() {
        return EventType.SEND_GROUP_REMINDER;
    }

    @Override
    public LocalDateTime getExpectedExecutionDateTime(LocalDate date) {
        return LocalDateTime.of(date.minusDays(1), LocalTime.of(19, 00));
    }

    @Override
    public void doAction(Event event) {}
}
