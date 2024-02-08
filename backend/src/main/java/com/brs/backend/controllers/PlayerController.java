package com.brs.backend.controllers;

import com.brs.backend.dto.HistoryType;
import com.brs.backend.dto.PlayerEncounterHistory;
import com.brs.backend.dto.PlayerHistory;
import com.brs.backend.dto.PlayerInfo;
import com.brs.backend.model.Player;
import com.brs.backend.services.EncounterService;
import com.brs.backend.services.PlayerService;
import com.brs.backend.services.ScoreHistoryService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PlayerController {

    @Autowired
    private ScoreHistoryService scoreHistoryService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private EncounterService encounterService;

    @GetMapping("/players")
    public List<PlayerInfo> getAllPlayers() {
        return playerService.getAllPlayerInfo();
    }

    @GetMapping("/players/history")
    public List<PlayerHistory> getAllPlayersHistory(@RequestParam(defaultValue = "RANK") HistoryType type) {
        return playerService.getAllPlayers().stream()
                .map(e -> scoreHistoryService.getPlayerHistory(e.getId(), type))
                .toList();
    }

    @GetMapping("/players/{playerId}/history")
    public PlayerHistory gePlayerHistory(@PathVariable int playerId, @RequestParam(defaultValue = "RANK") HistoryType type) {
        return scoreHistoryService.getPlayerHistory(playerId, type);
    }

    @GetMapping("/players/{playerId}/encounters")
    public ResponseEntity<PlayerEncounterHistory> getPlayerEncounterHistory(@PathVariable int playerId) {
        var playerEncounterHistory = encounterService.getPlayerEncounterHistory(playerId);
        if (playerEncounterHistory == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(playerEncounterHistory);
        }
    }

    @PostMapping("/players/update-ranking")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public List<Player> updateRanking() {
        return playerService.updatePlayerRanking();
    }
}
