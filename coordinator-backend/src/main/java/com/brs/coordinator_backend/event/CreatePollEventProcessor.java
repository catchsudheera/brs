package com.brs.coordinator_backend.event;

import com.brs.coordinator_backend.communication.TelegramBotInstance;
import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.model.EncounterScheduleProperties;
import com.brs.coordinator_backend.model.Event;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CreatePollEventProcessor extends AbstractEventProcessor {

    private final TelegramBotInstance telegramBotInstance;

    @Autowired
    public CreatePollEventProcessor(
            EncounterEventListConfig encounterEventListConfig,
            TelegramBotInstance telegramBotInstance) {
        super(encounterEventListConfig);
        this.telegramBotInstance = telegramBotInstance;
    }

    @Override
    public EventType getEventType() {
        return EventType.CREATE_POLL;
    }

    @Override
    public LocalDateTime getExpectedExecutionDateTime(LocalDate date) {
        return LocalDateTime.of(date.minusDays(2), LocalTime.NOON);
    }

    @Override
    public void doAction(Event event) {
        var encounterSchedule = event.getEncountersSchedule();
        var encounterEvent = getEncounterEvent(encounterSchedule);
        if (encounterEvent == null) return;
        var subject =
                "Joining badminton on "
                        + encounterSchedule.getEncounterScheduleDate().toString()
                        + ".";
        var pollResponse =
                telegramBotInstance.createPoll(
                        encounterEvent.chatBot(),
                        encounterEvent.memberGroup(),
                        subject,
                        new String[] {"Yes", "No"});
        var encounterScheduleProperties = encounterSchedule.getEncounterScheduleProperties();
        if (encounterScheduleProperties == null) {
            encounterScheduleProperties = new EncounterScheduleProperties();
            encounterSchedule.setEncounterScheduleProperties(encounterScheduleProperties);
        }
        encounterScheduleProperties.setPollMessageId(pollResponse.component1());
        encounterScheduleProperties.setPollId(pollResponse.component2());
    }
}
