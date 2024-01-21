package com.brs.backend.repositories;

import com.brs.backend.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Integer> {

    Optional<Player> findOptionalPlayerByName(String name);

}
