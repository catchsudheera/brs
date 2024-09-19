package com.brs.coordinator_backend.repositories;

import com.brs.coordinator_backend.model.EncountersSchedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EncountersSchedulesRepository extends JpaRepository<EncountersSchedule, Integer> {

    @Query(
            value =
                    """
                    SELECT distinct(encounterEvent) FROM ENCOUNTERS_SCHEDULES
                    """)
    List<String> findDistinctEncounterSchedules();

    EncountersSchedule findFirstByEncounterEventOrderByEncounterScheduleDate(String encounterEvent);
}
