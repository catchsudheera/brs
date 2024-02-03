package com.brs.backend.dto;

import java.time.LocalDate;

public record FlatHistoryItem(Integer encounterId, LocalDate encounterDate, Integer oldRank, Integer newRank, Double oldRankScore, Double newRankScore) {
}
