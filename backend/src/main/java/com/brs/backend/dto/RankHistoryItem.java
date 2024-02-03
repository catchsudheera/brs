package com.brs.backend.dto;

import java.time.LocalDate;

public record RankHistoryItem(LocalDate date, int oldRank, int newRank) {
}
