package com.brs.backend.controllers;

import com.brs.backend.core.RankScoreCalculator;
import com.brs.backend.core.RankScoreCalculatorProvider;
import com.brs.backend.dto.EncounterResult;
import com.brs.backend.model.Encounter;
import com.brs.backend.model.Player;
import com.brs.backend.repositories.EncounterRepository;
import com.brs.backend.services.PlayerService;
import com.brs.backend.services.ScoreHistoryService;
import com.brs.backend.util.EncounterUtil;
import com.brs.backend.util.PlayerUtil;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

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

    @Autowired
    private EncounterUtil encounterUtil;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ScoreHistoryService scoreHistoryService;

    @GetMapping("/encounters")
    private List<Encounter> getAllEncounters() {
        return encounterRepository.findAll();
    }

    @PostMapping("/encounters/{date}/add")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    private String addEncounters(
            @PathVariable LocalDate date,
            @RequestBody EncounterResult result
    ) {
        log.info("Adding team 1 : {} and team 2 : {} for date : {}", result.team1(), result.team2(), date);

        Encounter saved = persistEncounterResult(date, result);
        log.info("Saved : {}", saved.getId());
        return "ok";
    }

    @PostMapping(value = "/encounters/add-by-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
    private String addEncountersByFile(@RequestParam("file") MultipartFile file) {

        // TODO handle these ugly runtime exceptions and replace them with proper exceptions caughtable by a response handler
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("File name should not be null");
        }

        if (!fileName.startsWith("encounter_")) {
            throw new RuntimeException("Encounter file name should starts with 'encounter_'");
        }

        String dateSubStr = fileName.substring(10, 20);

        if (!Pattern.compile("20[2-9][0-9]-[0-9][0-2]-[0-3][0-9]").matcher(dateSubStr).find()) {
            throw new RuntimeException("Encounter file name should starts with 'encounter_' and then should be immediately followed by a date string in the format of yyyy-mm-dd");
        }

        LocalDate encounterDate = LocalDate.parse(dateSubStr);

        if (!fileName.endsWith(".csv")) {
            throw new RuntimeException("Encounter file name should have the extension : '.csv'");
        }

        List<EncounterResult> encounterResults = encounterUtil.parseCsvFileToEncounters(file);

        for (EncounterResult encounterResult : encounterResults) {
            persistEncounterResult(encounterDate, encounterResult);
            log.info("Persisted encounter : {} for : {}", encounterResult, encounterDate);
        }

        return "ok";
    }

    @PostMapping("/encounters/{date}/process")
    @Parameter(name = "x-api-key", required = true, example = "sample-api-key", in = ParameterIn.HEADER)
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
        List<Player> absentPlayers = playerService.getAllPlayers();

        for (Encounter unprocessedEncounter : unprocessedEncounters) {
            rankScoreCalculator.calculateAndPersist(unprocessedEncounter);
            playerUtil.getPlayersByIdsString(unprocessedEncounter.getTeam1()).forEach(absentPlayers::remove);
            playerUtil.getPlayersByIdsString(unprocessedEncounter.getTeam2()).forEach(absentPlayers::remove);
        }

        log.info("Following players are absentees : {}", absentPlayers);
        rankScoreCalculator.calculateAbsenteeScoreAndPersist(absentPlayers);

        log.info("Updating player ranking once process every encounter for the date : {}", date);
        List<Player> updatePlayerRanking = playerService.updatePlayerRanking();

        log.info("Updating the new ranks in the history table");
        for (Player player : updatePlayerRanking) {
            log.info("  - updating player : {}", player.getId());
            scoreHistoryService.updatePlayerEncounterNewRanking(player.getId(), date, player.getPlayerRank());
        }

        return "Done";
    }


    private Encounter persistEncounterResult(LocalDate date, EncounterResult result) {
        Encounter encounter = Encounter.builder()
                .encounterDate(date)
                .team1(playerUtil.getTeamPlayerIdsString(result.team1()))
                .team2(playerUtil.getTeamPlayerIdsString(result.team2()))
                .processed(false)
                .team1SetPoints(result.team1().setPoints())
                .team2SetPoints(result.team2().setPoints())
                .build();

        return encounterRepository.save(encounter);
    }
}
