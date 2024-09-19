package com.brs.coordinator_backend.repositories;

import com.brs.coordinator_backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventsRepository extends JpaRepository<Event, Integer> {}
