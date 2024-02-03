package com.brs.backend.controllers;

import com.brs.backend.dto.PlayerHistory;
import com.brs.backend.model.Player;
import com.brs.backend.services.PlayerService;
import com.brs.backend.services.ScoreHistoryService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PlayerController {

    @Autowired
    private ScoreHistoryService scoreHistoryService;

    @Autowired
    private PlayerService playerService;

    @GetMapping("/players")
    public List<Player> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/players/history")
    public List<PlayerHistory> getAllPlayersHistory() {
        return playerService.getAllPlayers().stream()
                .map(e -> scoreHistoryService.getPlayerHistory(e.getId()))
                .toList();
    }

    @GetMapping("/players/{playerId}/history")
    public PlayerHistory gePlayerHistory(@PathVariable int playerId) {
        return scoreHistoryService.getPlayerHistory(playerId);
    }

    @PostMapping("/players/update-ranking")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public List<Player> updateRanking() {
        return playerService.updatePlayerRanking();
    }
}
