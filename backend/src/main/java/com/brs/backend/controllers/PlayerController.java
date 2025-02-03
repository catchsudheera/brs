package com.brs.backend.controllers;

import com.brs.backend.configuration.ApiKeyAuth;
import com.brs.backend.core.CommonAbsenteeManager;
import com.brs.backend.dto.*;
import com.brs.backend.model.Player;
import com.brs.backend.services.EncounterService;
import com.brs.backend.services.PlayerService;
import com.brs.backend.services.ScoreHistoryService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PlayerController {

    private final ScoreHistoryService scoreHistoryService;

    private final PlayerService playerService;

    private final EncounterService encounterService;

    private final CommonAbsenteeManager commonAbsenteeManager;

    @GetMapping("/players")
    public List<PlayerInfo> getActivePlayers() {
        return playerService.getPlayerInfoByStatus(false);
    }

    @GetMapping("/players/inactive")
    public List<PlayerInfo> getInactivePlayers() {
        return playerService.getPlayerInfoByStatus(true);
    }

    @GetMapping("/players/history")
    public List<PlayerHistory> getAllPlayersHistory(@RequestParam(defaultValue = "RANK") HistoryType type) {
        return playerService.getAllPlayers().stream()
                .filter(p -> !p.isDisabled())
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

    @PostMapping("/v2/players/{playerId}/activate")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public void activatePlayer(@PathVariable int playerId) {
        playerService.activatePlayer(playerId);
    }

    @PostMapping("/v2/players/update-ranking")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public List<Player> updateRanking() {
        return playerService.updatePlayerRanking();
    }

    @PostMapping("/v2/players")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public PlayerInfo addNewPlayer(@RequestBody NewPlayer player) {
        return playerService.addPlayer(player);
    }

    @PutMapping("/v2/players")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public PlayerInfo updatePlayer(@RequestBody UpdatePlayer player) {
        return playerService.updatePlayer(player);
    }

    @GetMapping("/v2/auth")
    public PlayerAuth authPlayer(){
       return playerService.getPlayerAuth();
    }
}
