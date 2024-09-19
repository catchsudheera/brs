package com.brs.coordinator_backend.controllers;

import com.brs.coordinator_backend.service.EncounterEventsUploadProcessingService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequiredArgsConstructor
public class FileUploadController {

    private final EncounterEventsUploadProcessingService encounterEventsUploadProcessingService;

    @PostMapping(
            value = "/encounter-events/add-by-file",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Parameter(
            name = "x-api-key",
            required = true,
            example = "sample-api-key",
            in = ParameterIn.HEADER)
    public String addEncounterEventsByFiles(@RequestParam("file") MultipartFile file) {

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("File name should not be null");
        }

        if (!fileName.startsWith("encounter_events_")) {
            throw new RuntimeException("Encounter file name should starts with 'encounter_'");
        }

        var dateSubStr = fileName.substring(17);

        if (!fileName.endsWith(".csv")) {
            throw new RuntimeException("Encounter file name should have the extension : '.csv'");
        }
        var encounterDate = FilenameUtils.removeExtension(dateSubStr);
        encounterEventsUploadProcessingService.processFile(file, encounterDate);

        return "done";
    }
}
