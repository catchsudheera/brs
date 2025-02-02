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

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import static com.brs.backend.common.Constants.DEMERIT_POINTS_ABSENTEE;

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

    @Transactional
    public void deactivatePlayer(Player player, int encounterId, LocalDate encounterDate) {
        // Loading again in the current transactional context
        player = playerRepository.findById(player.getId()).orElseThrow();
        player.setDisabled(true);
        player.setPlayerRank(-1);
        player.setRankSince(encounterDate);
        playerRepository.save(player);
        updateScoreHistory(player, encounterId, encounterDate, player.getRankScore(), player.getRankScore());
    }

    @Transactional
    public void activatePlayer(Player player) {
        // Loading again in the current transactional context
        player = playerRepository.findById(player.getId()).orElseThrow();
        player.setDisabled(false);
        var games = scoreHistoryRepository.findAllByPlayerId(player.getId());
        var lastActiveGame = games.stream().filter(g -> g.getEncounterId() > 0).max(Comparator.comparing(ScoreHistory::getEncounterDate)).orElseThrow();
        var lastActiveGameScore = lastActiveGame.getNewRankScore();
        var lastRankScore = player.getRankScore();
        var newScore = lastActiveGameScore - (DEMERIT_POINTS_ABSENTEE * 4);
        player.setRankScore(newScore);
        playerRepository.save(player);
        updateScoreHistory(player, -3, LocalDate.now(), lastRankScore, newScore);
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
