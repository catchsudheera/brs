package com.brs.backend.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class PlayerScoreHistory extends PlayerHistory {
    private final List<ScoreHistoryItem> history;

    public PlayerScoreHistory(String name, int playerId, List<ScoreHistoryItem> items) {
        super(name, playerId);
        this.history = items;
    }
}
