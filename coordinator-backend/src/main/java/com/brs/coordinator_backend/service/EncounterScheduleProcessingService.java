package com.brs.coordinator_backend.service;

import com.brs.coordinator_backend.dto.EncounterEventScheduleStatus;
import com.brs.coordinator_backend.event.AbstractEventProcessor;
import com.brs.coordinator_backend.repositories.EncountersSchedulesRepository;
import com.brs.coordinator_backend.repositories.EventsRepository;
import jakarta.transaction.Transactional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EncounterScheduleProcessingService {

    private final EncountersSchedulesRepository encountersSchedulesRepository;

    private final Set<AbstractEventProcessor> eventProcessorsSet;

    private final EventsRepository eventsRepository;

    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void processEventSchedules() {
        var encounterScheduleNames = encountersSchedulesRepository.findDistinctEncounterSchedules();
        encounterScheduleNames.forEach(this::processEncounterSchedule);
    }

    private void processEncounterSchedule(String encounterScheduleName) {
        var encounterSchedule =
                encountersSchedulesRepository.findFirstByEncounterEventOrderByEncounterScheduleDate(
                        encounterScheduleName);
        if (encounterSchedule.getEncounterEventScheduleStatus()
                == EncounterEventScheduleStatus.PENDING) {
            encounterSchedule.setEncounterEventScheduleStatus(
                    EncounterEventScheduleStatus.IN_PROGRESS);
            encountersSchedulesRepository.save(encounterSchedule);
            var events =
                    eventProcessorsSet.stream()
                            .map(eventProcessor -> eventProcessor.buildEvents(encounterSchedule))
                            .toList();
            eventsRepository.saveAll(events);
            log.info("Encounter event schedule processed: {}", encounterScheduleName);
        } else {
            log.info(
                    "Encounter event schedule skipped as not in pending state: {}",
                    encounterScheduleName);
        }
    }
}
