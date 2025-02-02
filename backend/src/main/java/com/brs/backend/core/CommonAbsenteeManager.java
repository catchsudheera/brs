package com.brs.backend.core;

import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.EncounterRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static com.brs.backend.common.Constants.DEMERIT_POINTS_ABSENTEE;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommonAbsenteeManager {

    private final ScorePersister scorePersister;

    private final EncounterRepository encounterRepository;

    private final ScoreHistoryRepository scoreHistoryRepository;

    public void calculateAbsenteeScoreAndPersist(List<Player> players) {
        var absentees = new ArrayList<Player>();
        var longTermAbsentees = new ArrayList<Player>();
        var encounters = encounterRepository.findAllDistinctEncounterDateOrdered();
        if (encounters.size() <= 6) {
            log.info("There are not enough encounters played to disable players");
            deductPointsForAbsentees(players);
            return;
        }
        var cutOverDate = encounters.get(6);
        for (Player player : players) {
            var games = scoreHistoryRepository.findAllByPlayerId(player.getId());
            var lastActiveGame = games.stream().filter(g -> g.getEncounterId() > 0).max(Comparator.comparing(ScoreHistory::getEncounterDate));
            if(lastActiveGame.isEmpty()) {
                continue;
            }
            var lastActiveGameDate = lastActiveGame.get().getEncounterDate();
            if (lastActiveGameDate.isBefore(cutOverDate)) {
                longTermAbsentees.add(player);
            } else {
                absentees.add(player);
            }
        }
        deductPointsForAbsentees(absentees);
        deactivateLongTermAbsentees(longTermAbsentees);
    }

    public void deactivateLongTermAbsentees(ArrayList<Player> longTermAbsentees) {
        longTermAbsentees.forEach(player -> scorePersister.deactivatePlayer(player, -2, LocalDate.now()));
    }

    private void deductPointsForAbsentees(List<Player> players) {
        for (Player player : players) {
            scorePersister.updatePlayer(DEMERIT_POINTS_ABSENTEE, -1, LocalDate.now(), player);
        }
    }

}
