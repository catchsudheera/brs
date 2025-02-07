package com.brs.backend.services;

import com.brs.backend.dto.GamePlayer;
import com.brs.backend.model.Player;
import com.brs.backend.repositories.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final PlayerRepository playerRepository;

    public List<GamePlayer> getAvailablePlayersForGame() {
        var players = playerRepository.findAll().stream()
                .filter(Player::isAvailableForGame)
                .sorted(Comparator.comparingInt(Player::getPlayerRank)) // First with the current ranking to keep consistent ranking when scores are the same
                .sorted((d1, d2) -> Double.compare(d2.getRankScore(), d1.getRankScore())) // Second with the descending order of rank setPoints
                .toList();
        int currentRank = 0;
        var rankList = new ArrayList<GamePlayer>();
        for (var player : players) {
            rankList.add(new GamePlayer(player.getId(), ++currentRank));
        }
        return rankList;
    }


}
