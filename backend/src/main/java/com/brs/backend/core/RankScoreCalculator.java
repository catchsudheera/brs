package com.brs.backend.core;

import com.brs.backend.model.Encounter;

public interface RankScoreCalculator {

    void calculateAndPersist(Encounter encounter);
}
