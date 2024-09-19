package com.brs.coordinator_backend.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Converter(autoApply = true)
public class JsonToObjectConverter
        implements AttributeConverter<EncounterScheduleProperties, String> {

    @Override
    public String convertToDatabaseColumn(EncounterScheduleProperties encounterScheduleProperties) {
        if (encounterScheduleProperties == null) {
            return null;
        }
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(encounterScheduleProperties);
        } catch (JsonProcessingException e) {
            log.error(
                    "Serializing {} failed with error {}",
                    encounterScheduleProperties,
                    e.getMessage());
            return null;
        }
    }

    @Override
    public EncounterScheduleProperties convertToEntityAttribute(String s) {
        if (s == null) {
            return null;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(s, EncounterScheduleProperties.class);
        } catch (IOException e) {
            log.error("Deserializing {} failed with error {}", s, e.getMessage());
            return null;
        }
    }
}
