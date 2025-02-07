package com.brs.backend.controllers;

import com.brs.backend.dto.*;
import com.brs.backend.dto.request.ActivateUser;
import com.brs.backend.dto.request.NewPlayer;
import com.brs.backend.dto.request.UpdatePlayer;
import com.brs.backend.model.Player;
import com.brs.backend.services.EncounterService;
import com.brs.backend.services.PlayerService;
import com.brs.backend.services.ScoreHistoryService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class PlayerController {

    private final ScoreHistoryService scoreHistoryService;

    private final PlayerService playerService;

    private final EncounterService encounterService;

    @GetMapping("/players")
    public List<PlayerInfo> getPlayers(@RequestParam Optional<String> status) {
        return playerService.getPlayerInfoByStatus(status);
    }

    @GetMapping("/v2/auth/players")
    public List<SecurePlayerInfo> getPlayersAuth(@RequestParam Optional<String> status) {
        return playerService.getSecurePlayerInfoByStatus(status);
    }

    @GetMapping("/players/history")
    public List<PlayerHistory> getAllPlayersHistory(@RequestParam(defaultValue = "RANK") HistoryType type) {
        return playerService.getAllPlayers().stream()
                .filter(Player::isActive)
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
    public void activatePlayer(@PathVariable int playerId, @RequestBody Optional<ActivateUser> activateUser) {
        Double requestedScore = null;
        if(activateUser.isPresent()) {
            requestedScore = activateUser.get().getScore();
        }
        playerService.activatePlayer(playerId, requestedScore);

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

    @PutMapping("/v2/players/{id}")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    public PlayerInfo updatePlayer(@PathVariable int id, @RequestBody UpdatePlayer player) {
        player.setId(id);
        return playerService.updatePlayer(player);
    }

    @GetMapping("/v2/auth")
    public PlayerAuth authPlayer(){
       return playerService.getPlayerAuth();
    }
}
