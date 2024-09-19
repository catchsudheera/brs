package com.brs.coordinator_backend.service;

import com.brs.coordinator_backend.dto.EncounterEventScheduleStatus;
import com.brs.coordinator_backend.model.EncountersSchedule;
import com.brs.coordinator_backend.repositories.EncountersSchedulesRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class EncounterEventsUploadProcessingService {

    private final EncountersSchedulesRepository encountersSchedulesRepository;

    public void processFile(MultipartFile file, String encounterEventName) {
        var dates = extractDates(file);
        var encounterSchedules =
                dates.stream()
                        .map(
                                date ->
                                        EncountersSchedule.builder()
                                                .encounterEvent(encounterEventName)
                                                .encounterScheduleDate(date)
                                                .encounterEventScheduleStatus(
                                                        EncounterEventScheduleStatus.PENDING)
                                                .build())
                        .toList();
        encountersSchedulesRepository.saveAll(encounterSchedules);
        log.info("Encounter Schedules for the date {} is processed.", encounterEventName);
    }

    private List<LocalDate> extractDates(MultipartFile file) {
        var encounterEvents = new ArrayList<LocalDate>();
        InputStream inputStream = null;
        try {
            inputStream = file.getInputStream();
        } catch (IOException e) {
            log.error("Could not read stream", e);
            throw new RuntimeException(e);
        }
        new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))
                .lines()
                .forEach(
                        line -> {
                            encounterEvents.add(LocalDate.parse(line));
                        });
        return encounterEvents;
    }
}
