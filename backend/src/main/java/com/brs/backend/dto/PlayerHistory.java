package com.brs.backend.dto;

import java.util.List;

public record PlayerHistory(String playerName, Integer playerId, List<HistoryItem> historyItems) {
}
