package com.brs.backend.services;

import com.brs.backend.dto.HistoryItem;
import com.brs.backend.dto.PlayerHistory;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ScoreHistoryService {

    @Autowired
    private ScoreHistoryRepository scoreHistoryRepository;

    @Autowired
    private PlayerRepository playerRepository;

    public PlayerHistory getPlayerHistory(int playerId) {
        List<ScoreHistory> shs = scoreHistoryRepository.findAllByPlayerId(playerId);
        Optional<Player> player = playerRepository.findById(playerId);


        List<HistoryItem> items = shs.stream()
                .map(e -> new HistoryItem(e.getEncounterId(),
                        e.getEncounterDate(),
                        e.getPlayerOldRank(),
                        e.getPlayerNewRank(),
                        e.getOldRankScore(),
                        e.getNewRankScore()))
                .toList();

        return new PlayerHistory(player.orElseThrow().getName(), playerId, items);
    }

    public List<PlayerHistory> getPlayersHistoryList(List<Integer> playerIds) {
        return playerIds.stream()
                .map(this::getPlayerHistory)
                .toList();
    }

    public void updatePlayerEncounterNewRanking(int playerId, LocalDate encounterDate, int newRanking) {
        List<ScoreHistory> allByPlayerIdAndEncounterDate = scoreHistoryRepository.findAllByPlayerIdAndEncounterDate(playerId, encounterDate);
        for (ScoreHistory scoreHistory : allByPlayerIdAndEncounterDate) {
            scoreHistory.setPlayerNewRank(newRanking);
            scoreHistoryRepository.save(scoreHistory);
        }
    }
}
