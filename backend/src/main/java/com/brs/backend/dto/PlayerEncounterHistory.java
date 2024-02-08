package com.brs.backend.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class PlayerEncounterHistory extends PlayerHistory{
    private final List<PlayerEncounterHistoryRecord> encounterHistory;

    public PlayerEncounterHistory(String playerName, Integer playerId, List<PlayerEncounterHistoryRecord> encounterHistory) {
        super(playerName, playerId);
        this.encounterHistory = encounterHistory;
    }
}
