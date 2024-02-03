package com.brs.backend.repositories;

import com.brs.backend.model.ScoreHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, Integer> {

    List<ScoreHistory> findAllByPlayerId(Integer id);

    List<ScoreHistory> findAllByPlayerIdAndEncounterDate(Integer playerId, LocalDate encounterDate);
}
