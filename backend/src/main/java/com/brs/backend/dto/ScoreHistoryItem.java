package com.brs.backend.dto;

import java.time.LocalDate;

public record ScoreHistoryItem(Integer encounterId, LocalDate encounterDate, Double oldRankScore, Double newRankScore) {
}
