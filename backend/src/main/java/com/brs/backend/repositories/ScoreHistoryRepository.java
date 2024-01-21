package com.brs.backend.repositories;

import com.brs.backend.model.ScoreHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, Integer> {
}
