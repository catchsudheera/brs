package com.brs.backend.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class PlayerFlatHistory extends PlayerHistory {
    private final List<FlatHistoryItem> history;

    public PlayerFlatHistory(String name, int playerId, List<FlatHistoryItem> items) {
        super(name, playerId);
        this.history = items;
    }
}
