package com.brs.coordinator_backend.event;

import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.model.Event;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SendOpenSlotGroupMessageProcessor extends AbstractEventProcessor {

    @Autowired
    protected SendOpenSlotGroupMessageProcessor(EncounterEventListConfig encounterEventListConfig) {
        super(encounterEventListConfig);
    }

    @Override
    public EventType getEventType() {
        return EventType.SEND_OPENSLOT_MSG;
    }

    @Override
    public LocalDateTime getExpectedExecutionDateTime(LocalDate date) {
        return date.atTime(13, 1);
    }

    @Override
    public void doAction(Event event) {}
}
