package com.brs.backend.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class PlayerRankHistory extends PlayerHistory {
    private final List<RankHistoryItem> history;

    public PlayerRankHistory(String name, int playerId, List<RankHistoryItem> items) {
        super(name, playerId);
        this.history = items;
    }
}
