package com.brs.coordinator_backend.model;

import java.io.Serializable;
import lombok.Data;

@Data
public class EncounterScheduleProperties implements Serializable {

    private String pollId;
    private Integer pollMessageId;
}
