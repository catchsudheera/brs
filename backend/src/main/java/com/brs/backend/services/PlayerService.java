package com.brs.backend.services;

import com.brs.backend.model.Player;
import com.brs.backend.repositories.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    public void updatePlayerRanking() {
        List<Player> playerList = playerRepository.findAll()
                .stream()
                .sorted(Comparator.comparingDouble(Player::getId)) // First with id to keep consistent ranking when scores are the same
                .sorted((d1, d2) -> Double.compare(d2.getRankScore(), d1.getRankScore())) // Second with the descending order of rank setPoints
                .toList();

        int rank = 0;
        for (Player player : playerList) {
            player.setPlayerRank(++rank);
            playerRepository.save(player);
        }
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }
}
