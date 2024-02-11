package com.brs.backend.services;

import com.brs.backend.dto.PlayerEncounterHistory;
import com.brs.backend.dto.PlayerEncounterHistoryRecord;
import com.brs.backend.dto.PlayerHistory;
import com.brs.backend.model.Encounter;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.EncounterRepository;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EncounterService {

    private final EncounterRepository encounterRepository;

    private final ScoreHistoryRepository scoreHistoryRepository;

    private final PlayerRepository playerRepository;

    private static final String ENCOUNTER_SEPARATOR = ":";
    Map<Integer, Player> playerCache = new HashMap<>();

    public PlayerEncounterHistory getPlayerEncounterHistory(int playerId) {
        PlayerHistory currentPlayer = getPlayerInfo(playerId);
        if (currentPlayer == null) {
            return null;
        }
        var encountersIds = scoreHistoryRepository.findAllByPlayerId(playerId)
                .stream()
                .map(ScoreHistory::getEncounterId)
                .toList();
        var encounters = encounterRepository.findAllByIdIn(encountersIds)
                .stream()
                .sorted(Comparator.comparing(Encounter::getEncounterDate)
                        .thenComparing(Encounter::getId).reversed()).toList();
        var playerEncounterHistoryRecords = new ArrayList<PlayerEncounterHistoryRecord>();
        for (Encounter encounter : encounters) {
            List<PlayerHistory> playerTeam;
            List<PlayerHistory> opponentTeam;
            int playerTeamPoints;
            int opponentTeamPoints;
            if (getPlayerTeam(encounter, playerId) == 1) {
                playerTeam = Arrays.stream(encounter.getTeam1().split(ENCOUNTER_SEPARATOR))
                        .map(Integer::valueOf).map(this::getPlayerInfo).toList();
                opponentTeam = Arrays.stream(encounter.getTeam2().split(ENCOUNTER_SEPARATOR))
                        .map(Integer::valueOf).map(this::getPlayerInfo).toList();
                playerTeamPoints = encounter.getTeam1SetPoints();
                opponentTeamPoints = encounter.getTeam2SetPoints();
            } else {
                playerTeam = Arrays.stream(encounter.getTeam2().split(ENCOUNTER_SEPARATOR))
                        .map(Integer::valueOf).map(this::getPlayerInfo).toList();
                opponentTeam = Arrays.stream(encounter.getTeam1().split(ENCOUNTER_SEPARATOR))
                        .map(Integer::valueOf).map(this::getPlayerInfo).toList();
                playerTeamPoints = encounter.getTeam2SetPoints();
                opponentTeamPoints = encounter.getTeam1SetPoints();
            }
            var calculatedScore = encounter.getCalculatedScore();
            if(playerTeamPoints<opponentTeamPoints){
                calculatedScore *= -1;
            }
            playerEncounterHistoryRecords.add(
                    new PlayerEncounterHistoryRecord(
                            encounter.getEncounterDate(),
                            encounter.getId(),
                            calculatedScore,
                            opponentTeam,
                            opponentTeamPoints,
                            playerTeam,
                            playerTeamPoints
                    ));
        }

        return new PlayerEncounterHistory(currentPlayer.getPlayerName(),
                currentPlayer.getPlayerId(), playerEncounterHistoryRecords);
    }

    private PlayerHistory getPlayerInfo(Integer playerId) {
        var player = playerCache.computeIfAbsent(playerId, id -> playerRepository.findById(id).orElse(null));
        if (player == null) {
            return null;
        }
        return new PlayerHistory(player.getName(), playerId);
    }

    private int getPlayerTeam(Encounter encounter, Integer playerId) {
        if (Arrays.stream(encounter.getTeam1().split(ENCOUNTER_SEPARATOR))
                .anyMatch(p -> Integer.valueOf(p).equals(playerId))) {
            return 1;
        } else
            return 2;
    }
}
