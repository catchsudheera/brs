package com.brs.coordinator_backend.service;

import com.brs.coordinator_backend.dto.EncounterEventScheduleStatus;
import com.brs.coordinator_backend.dto.EventStatus;
import com.brs.coordinator_backend.dto.EventType;
import com.brs.coordinator_backend.event.AbstractEventProcessor;
import com.brs.coordinator_backend.model.Event;
import com.brs.coordinator_backend.repositories.EncountersSchedulesRepository;
import com.brs.coordinator_backend.repositories.EventsRepository;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EncounterScheduleEventProcessingService {

    private final EncountersSchedulesRepository encountersSchedulesRepository;

    private final EventsRepository eventsRepository;

    private final Set<AbstractEventProcessor> eventProcessorsSet;

    private Map<EventType, AbstractEventProcessor> eventProcessors = new HashMap<>();

    @PostConstruct
    private void initilizeEventProcessors() {
        eventProcessorsSet.stream()
                .forEach(event -> eventProcessors.put(event.getEventType(), event));
    }

        @Scheduled(fixedRate = 60 * 60 * 1000)
    public void processEventSchedules() {
        var encounterScheduleNames = encountersSchedulesRepository.findDistinctEncounterSchedules();
        encounterScheduleNames.forEach(this::processEncounterSchedule);
    }

    private void processEncounterSchedule(String encounterScheduleName) {
        var encounterSchedule =
                encountersSchedulesRepository.findFirstByEncounterEventOrderByEncounterScheduleDate(
                        encounterScheduleName);
        if (encounterSchedule.getEncounterEventScheduleStatus()
                != EncounterEventScheduleStatus.IN_PROGRESS) {
            log.info("Encounter Schedule for {} is not pending", encounterScheduleName);
            return;
        }

                encounterSchedule.getEvents()
                        .stream()
                        .filter(e -> e.getExpectedExecutionTime().isBefore(LocalDateTime.now()))
                        .filter(event -> event.getEventStatus() == EventStatus.PENDING)
                        .forEach(this::processEvent);
        log.info(
                "All events applicable are processed for encounter schedule {}", encounterSchedule);
    }

    private void processEvent(Event event) {
        var eventProcessor = eventProcessors.get(event.getEventType());
        if (eventProcessor != null) {
            eventProcessor.doAction(event);
            event.setEventStatus(EventStatus.COMPLETED);
        } else {
            log.error("No Event processor defined for event type {}", event.getEventType().name());
            event.setEventStatus(EventStatus.FAILED);
        }
        eventsRepository.save(event);
    }
}
