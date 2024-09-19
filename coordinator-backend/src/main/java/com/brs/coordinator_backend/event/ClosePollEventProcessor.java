package com.brs.coordinator_backend.event;

import com.brs.coordinator_backend.communication.TelegramBotInstance;
import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.model.Event;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ClosePollEventProcessor extends AbstractEventProcessor {

    private final TelegramBotInstance telegramBotInstance;

    @Autowired
    public ClosePollEventProcessor(
            EncounterEventListConfig encounterEventListConfig,
            TelegramBotInstance telegramBotInstance) {
        super(encounterEventListConfig);
        this.telegramBotInstance = telegramBotInstance;
    }

    @Override
    public EventType getEventType() {
        return EventType.CLOSE_POLL;
    }

    @Override
    public LocalDateTime getExpectedExecutionDateTime(LocalDate date) {
        return date.atTime(13, 0);
    }

    @Override
    public void doAction(Event event) {
        var encounterSchedule = event.getEncountersSchedule();
        var encounterEvent = getEncounterEvent(encounterSchedule);
        if (encounterEvent == null) return;
        telegramBotInstance.closePoll(
                encounterEvent.chatBot(),
                encounterEvent.memberGroup(),
                encounterSchedule.getEncounterScheduleProperties().getPollMessageId());
    }
}
