package com.brs.backend.core;

import com.brs.backend.model.Encounter;
import com.brs.backend.model.Player;

import java.util.List;

public interface RankScoreCalculator {

    void calculateAndPersist(Encounter encounter);

    void calculateAbsenteeScoreAndPersist(List<Player> players);
}
