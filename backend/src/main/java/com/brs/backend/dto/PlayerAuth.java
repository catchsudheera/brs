package com.brs.backend.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

@Data
@JsonSerialize
public class PlayerAuth {
    private int playerId;
    private String playerName;
    private AccessLevel[] accessLevel;
}
