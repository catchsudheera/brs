package com.brs.backend.controllers;

import com.brs.backend.core.RankScoreCalculator;
import com.brs.backend.core.RankScoreCalculatorProvider;
import com.brs.backend.dto.EncounterResult;
import com.brs.backend.model.Encounter;
import com.brs.backend.repositories.EncounterRepository;
import com.brs.backend.util.PlayerUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@Slf4j
public class EncounterController {

    // TODO use via service layer. Ain't got no time for that now
    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    PlayerUtil playerUtil;

    @Autowired
    private RankScoreCalculatorProvider rankScoreCalculatorProvider;

    @GetMapping("/encounters")
    private List<Encounter> getAllEncounters() {
        return encounterRepository.findAll();
    }

    @PostMapping("/encounters/{date}/add")
    private String addEncounters(
            @PathVariable LocalDate date,
            @RequestBody EncounterResult result
    ) {
        log.info("Adding team 1 : {} and team 2 : {} for date : {}", result.team1(), result.team2(), date);

        Encounter encounter = Encounter.builder()
                .encounterDate(date)
                .team1(playerUtil.getTeamPlayerIdsString(result.team1()))
                .team2(playerUtil.getTeamPlayerIdsString(result.team2()))
                .processed(false)
                .team1SetPoints(result.team1().setPoints())
                .team2SetPoints(result.team2().setPoints())
                .build();

        Encounter saved = encounterRepository.save(encounter);
        log.info("Saved : {}", saved);
        return "ok";
    }

    @PostMapping("/encounters/{date}/process")
    private String processEncounter(@PathVariable LocalDate date) {
        List<Encounter> encounters = encounterRepository.findAllByEncounterDate(date);
        log.info("Found {} encounters for date {}", encounters.size(), date);

        List<Encounter> unprocessedEncounters = encounters.stream()
                .filter(e -> !e.isProcessed())
                .toList();

        if (unprocessedEncounters.isEmpty()) {
            log.error("Found 0 unprocessed encounters for the date {}", date);
            throw new RuntimeException("No unprocessed encounters");
        }

        RankScoreCalculator rankScoreCalculator = rankScoreCalculatorProvider.getRankScoreCalculator();

        for (Encounter unprocessedEncounter : unprocessedEncounters) {
            rankScoreCalculator.calculateAndPersist(unprocessedEncounter);
        }

        return "Done";
    }
}
