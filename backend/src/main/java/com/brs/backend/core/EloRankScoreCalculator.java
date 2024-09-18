package com.brs.backend.core;

import com.brs.backend.model.Encounter;
import com.brs.backend.model.Player;
import com.brs.backend.util.PlayerUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
public class EloRankScoreCalculator implements RankScoreCalculator {

    @Autowired
    private PlayerUtil playerUtil;

    @Autowired
    private ScorePersister scorePersister;

    @Override
    public void calculateAndPersist(Encounter encounter) {

        List<Player> team1Players = playerUtil.getPlayersByIdsString(encounter.getTeam1());
        List<Player> team2Players = playerUtil.getPlayersByIdsString(encounter.getTeam2());

        double team1AverageRankScore = getTeamAverageRankScore(team1Players);
        double team2AverageRankScore = getTeamAverageRankScore(team2Players);


        double team1WinExpected = 1 / (1 + Math.pow(10, ((team2AverageRankScore - team1AverageRankScore) / 480)));
        double team1WinActual = encounter.getTeam1SetPoints() > encounter.getTeam2SetPoints() ? 1 : 0;

        // K value lowered to 20 from 40 in Sep, 2024
        double team1Score = BigDecimal.valueOf(20 * (team1WinActual - team1WinExpected)).setScale(2, RoundingMode.HALF_UP).doubleValue();
        double team2Score =  -1 * team1Score;

        scorePersister.persistScores(encounter.getId(), team1Score, team2Score);

    }

    @Override
    public void calculateAbsenteeScoreAndPersist(List<Player> players) {
        // Demerit points chnaged to -22 from -10 in Sep, 2024
        int demeritPoints = -22;

        for (Player player : players) {
            scorePersister.updatePlayer(demeritPoints, -1, LocalDate.now(),player);
        }
    }

    private double getTeamAverageRankScore(List<Player> team1Players) {
        return team1Players
                .stream()
                .mapToDouble(Player::getRankScore)
                .average().orElseThrow();
    }
}
