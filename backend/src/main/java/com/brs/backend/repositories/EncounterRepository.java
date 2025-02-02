package com.brs.backend.repositories;

import com.brs.backend.model.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface EncounterRepository extends JpaRepository<Encounter, Integer> {

    List<Encounter> findAllByEncounterDate(LocalDate date);

    List<Encounter> findAllByIdIn(List<Integer> encounterIds);

    @Query("SELECT DISTINCT en.encounterDate FROM ENCOUNTER en order by en.encounterDate desc")
    List<LocalDate> findAllDistinctEncounterDateOrdered();
}
