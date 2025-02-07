package com.brs.backend.services;

import com.brs.backend.dto.GamePlayer;
import com.brs.backend.model.Player;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.util.PlayerUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final PlayerRepository playerRepository;

    private final PlayerUtil playerUtil;

    public List<GamePlayer> getAvailablePlayersForGame() {
        var players = playerUtil.getRankedPlayers(playerRepository.findAll()
                .stream()
                .filter(Player::isAvailableForGame).toList());
        int rankForTheGame = 0;
        var rankList = new ArrayList<GamePlayer>();
        for (var player : players) {
            rankList.add(new GamePlayer(player.getId(), ++rankForTheGame));
        }
        return rankList;
    }


}
