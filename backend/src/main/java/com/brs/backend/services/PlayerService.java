package com.brs.backend.services;

import com.brs.backend.dto.PlayerInfo;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
public class PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private ScoreHistoryRepository scoreHistoryRepository;

    public List<Player> updatePlayerRanking() {
        List<Player> playerList = playerRepository.findAll()
                .stream()
                .sorted(Comparator.comparingInt(Player::getPlayerRank)) // First with the current ranking to keep consistent ranking when scores are the same
                .sorted((d1, d2) -> Double.compare(d2.getRankScore(), d1.getRankScore())) // Second with the descending order of rank setPoints
                .toList();

        List<Player> playerListSaved = new ArrayList<>();
        int rank = 0;
        for (Player player : playerList) {
            player.setPlayerRank(++rank);
            playerListSaved.add(playerRepository.save(player));
        }

        return playerListSaved;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public List<PlayerInfo> getAllPlayerInfo() {
        return getAllPlayers().stream()
                .map(e -> {
                    Optional<ScoreHistory> h = scoreHistoryRepository.findFirstByPlayerIdOrderByEncounterDateDesc(e.getId());
                    return new PlayerInfo(e.getId(), e.getName(), e.getRankScore(), e.getPlayerRank(), h.orElseThrow().getPlayerOldRank());
                })
                .toList();
    }
}
