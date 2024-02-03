package com.brs.backend.core;

import com.brs.backend.model.Encounter;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.EncounterRepository;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import com.brs.backend.util.PlayerUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class ScorePersister {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private ScoreHistoryRepository scoreHistoryRepository;

    @Autowired
    private PlayerUtil playerUtil;

    @Transactional
    public void persistScores(int encounterId, double team1Score, double team2Score) {

        Encounter encounter = encounterRepository.findById(encounterId).orElseThrow();
        encounter.setCalculatedScore(Math.abs(team1Score));
        encounter.setProcessed(true);
        encounterRepository.save(encounter);

        updatePlayers(team1Score, encounter.getTeam1(), encounter);
        updatePlayers(team2Score, encounter.getTeam2(), encounter);
    }

    private void updatePlayers(double teamScore, String teamIdsString, Encounter encounter) {
        List<Player> teamPlayers = playerUtil.getPlayersByIdsString(teamIdsString);

        for (Player player : teamPlayers) {
            updatePlayer(teamScore, encounter.getId(), encounter.getEncounterDate(), player);
        }
    }

    @Transactional
    public void updatePlayer(double playerScore, int encounterId, LocalDate encounterDate, Player player) {
        // Loading again in the current transactional context
        player = playerRepository.findById(player.getId()).orElseThrow();
        Double oldScore = player.getRankScore();
        Double newScore = oldScore + playerScore;
        player.setRankScore(newScore);
        playerRepository.save(player);

        updateScoreHistory(player, encounterId, encounterDate, oldScore, newScore);
    }

    private void updateScoreHistory(Player player, int encounterId, LocalDate encounterDate, Double oldScore, Double newScore) {
        ScoreHistory scoreHistory = ScoreHistory.builder()
                .playerId(player.getId())
                .encounterId(encounterId)
                .oldRankScore(oldScore)
                .newRankScore(newScore)
                .playerOldRank(player.getPlayerRank())
                .encounterDate(encounterDate)
                .build();

        scoreHistoryRepository.save(scoreHistory);
    }

}
