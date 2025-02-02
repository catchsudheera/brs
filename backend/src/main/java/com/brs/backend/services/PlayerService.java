package com.brs.backend.services;

import com.brs.backend.core.ScorePersister;
import com.brs.backend.dto.PlayerInfo;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.EncounterRepository;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@Component
@Slf4j
public class PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private ScoreHistoryRepository scoreHistoryRepository;

    @Autowired
    private ScorePersister scorePersister;

    public List<Player> updatePlayerRanking() {
        List<Player> playerList = playerRepository.findAll()
                .stream()
                .filter(p -> !p.isDisabled())
                .sorted(Comparator.comparingInt(Player::getPlayerRank)) // First with the current ranking to keep consistent ranking when scores are the same
                .sorted((d1, d2) -> Double.compare(d2.getRankScore(), d1.getRankScore())) // Second with the descending order of rank setPoints
                .toList();

        List<Player> playerListSaved = new ArrayList<>();
        int rank = 0;
        for (Player player : playerList) {
            player.setPlayerRank(++rank);
            if (player.getPlayerRank() < player.getHighestRank()) {
                player.setHighestRank(player.getPlayerRank());
                player.setRankSince(LocalDate.now());
            }
            playerListSaved.add(playerRepository.save(player));
        }

        return playerListSaved;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public List<PlayerInfo> getPlayerInfoByStatus(boolean disabled) {
        return getAllPlayers().stream()
                .filter(p -> p.isDisabled() == disabled)
                .map(e -> {
                    Optional<ScoreHistory> h = scoreHistoryRepository.findFirstByPlayerIdOrderByEncounterDateDesc(e.getId());
                    Period period = Period.between(LocalDate.now(), e.getRankSince());
                    int diff = Math.abs(period.getDays());
                    return new PlayerInfo(e.getId(), e.getName(), e.getRankScore(), e.getPlayerRank(),
                            h.orElseGet(() -> getMaxRank(e)).getPlayerOldRank(), e.getColorHex(), e.getHighestRank(), diff + " day(s)");
                })
                .toList();
    }


    public void activatePlayer(int playerId) {
        Player player = playerRepository.findById(playerId).orElseThrow();
        if (!player.isDisabled()) {
            log.info("Player is already active");
            return;
        }
        scorePersister.activatePlayer(player);
    }

    public void addPlayer(String name) {
        var lastActivePlayer = playerRepository.findAll().stream()
                .filter(p -> !p.isDisabled()).max(Comparator.comparingInt(Player::getPlayerRank)).orElseThrow();

        Player player = new Player();
        player.setName(name);
        player.setPlayerRank(lastActivePlayer.getPlayerRank() + 1);
        player.setHighestRank(lastActivePlayer.getPlayerRank() + 1);
        player.setRankScore(lastActivePlayer.getRankScore());
        player.setRankSince(LocalDate.now());
        player.setColorHex(generateRandomColorHex());
        playerRepository.save(player);
    }

    private ScoreHistory getMaxRank(Player e) {
        var dummyScoreHistory = new ScoreHistory();
        dummyScoreHistory.setPlayerOldRank(e.getPlayerRank());
        return dummyScoreHistory;
    }

    private String generateRandomColorHex() {
        Random random = new Random();
        int nextInt = random.nextInt(0xffffff + 1);
        return String.format("%06x", nextInt);
    }
}
