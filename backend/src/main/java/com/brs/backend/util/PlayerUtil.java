package com.brs.backend.util;

import com.brs.backend.dto.Team;
import com.brs.backend.dto.TeamV2;
import com.brs.backend.model.Player;
import com.brs.backend.repositories.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class PlayerUtil {

    private static final String PLAYER_ID_DELIMITER = ":";

    @Autowired
    PlayerRepository playerRepository;

    public String getTeamPlayerIdsString(Team team) {
        return getTeamPlayers(team)
                .stream()
                .map(Player::getId)
                .sorted()
                .map(Object::toString)
                .collect(Collectors.joining(PLAYER_ID_DELIMITER));
    }

    public String getTeamPlayerIdsStringV2(TeamV2 team) {
        return Arrays.asList(team.player1(),team.player2())
                .stream().sorted().map(Object::toString)
                .collect(Collectors.joining(PLAYER_ID_DELIMITER));
    }


    public List<Player> getPlayersByIdsString(String idsString) {
        return Arrays.stream(idsString.split(PLAYER_ID_DELIMITER))
                .map(e -> playerRepository.findById(Integer.parseInt(e)).orElseThrow())
                .toList();
    }

    public List<Player> getTeamPlayers(Team team) {
        return Stream.of(getPlayer(team.player1()), getPlayer(team.player2()))
                .sorted(Comparator.comparingDouble(Player::getId))
                .collect(Collectors.toList());
    }

    public Player getPlayer(String playerName) {
        Optional<Player> optionalPlayer1 = playerRepository.findOptionalPlayerByName(playerName);
        if (optionalPlayer1.isPresent()) {
            return optionalPlayer1.get();
        } else {
          throw new RuntimeException("Player with name '" + playerName + "' not found");
        }
    }
}
