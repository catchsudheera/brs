package com.brs.backend.controllers;

import com.brs.backend.dto.GamePlayer;
import com.brs.backend.services.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/v2/game/players")
    public List<GamePlayer> getPlayers() {
        return gameService.getAvailablePlayersForGame();
    }


}
