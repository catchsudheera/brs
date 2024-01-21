package com.brs.backend.controllers;

import com.brs.backend.model.Player;
import com.brs.backend.repositories.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController

public class PlayerController {

    // TODO use via service layer. Ain't got no time for that now
    @Autowired
    private PlayerRepository playerRepository;


    @GetMapping("/players")
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    @PostMapping("/players/update-ranking")
    public void updateRanking(){
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
}
