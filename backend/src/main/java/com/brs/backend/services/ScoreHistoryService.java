package com.brs.backend.services;

import com.brs.backend.dto.*;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScoreHistoryService {

    @Autowired
    private ScoreHistoryRepository scoreHistoryRepository;

    @Autowired
    private PlayerRepository playerRepository;

    public PlayerHistory getPlayerHistory(int playerId, HistoryType type) {
        List<ScoreHistory> shs = scoreHistoryRepository.findAllByPlayerId(playerId);
        Optional<Player> player = playerRepository.findById(playerId);

        switch (type) {
            case RANK -> {
                List<RankHistoryItem> items = shs.stream()
                        .map(e -> new RankHistoryItem(e.getEncounterDate(), e.getPlayerOldRank(), e.getPlayerNewRank()))
                        .collect(Collectors.toSet())
                        .stream()
                        .sorted(Comparator.comparing(RankHistoryItem::date))
                        .toList();
                return new PlayerRankHistory(player.orElseThrow().getName(), playerId, items);
            }
            case SCORE -> {
                List<ScoreHistoryItem> items = shs.stream()
                        .map(e -> new ScoreHistoryItem(e.getEncounterId(), e.getEncounterDate(), e.getOldRankScore(), e.getNewRankScore()))
                        .collect(Collectors.toSet())
                        .stream()
                        .sorted(Comparator.comparing(ScoreHistoryItem::encounterId))
                        .toList();
                return new PlayerScoreHistory(player.orElseThrow().getName(), playerId, items);
            }
            case ALL -> {
                List<FlatHistoryItem> items = shs.stream()
                        .map(e -> new FlatHistoryItem(e.getEncounterId(), e.getEncounterDate(), e.getPlayerOldRank(), e.getPlayerNewRank(), e.getOldRankScore(), e.getNewRankScore()))
                        .collect(Collectors.toSet())
                        .stream()
                        .sorted(Comparator.comparing(FlatHistoryItem::encounterId))
                        .toList();
                return new PlayerFlatHistory(player.orElseThrow().getName(), playerId, items);
            }
            case null, default -> throw new RuntimeException("History type now known : " + type);
        }
    }

    public void updatePlayerEncounterNewRanking(int playerId, LocalDate encounterDate, int newRanking) {
        List<ScoreHistory> allByPlayerIdAndEncounterDate = scoreHistoryRepository.findAllByPlayerIdAndEncounterDate(playerId, encounterDate);
        for (ScoreHistory scoreHistory : allByPlayerIdAndEncounterDate) {
            scoreHistory.setPlayerNewRank(newRanking);
            scoreHistoryRepository.save(scoreHistory);
        }
    }
}
