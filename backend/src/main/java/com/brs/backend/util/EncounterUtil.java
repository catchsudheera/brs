package com.brs.backend.util;

import com.brs.backend.dto.EncounterResult;
import com.brs.backend.dto.Team;
import com.opencsv.CSVReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.*;

@Component
@Slf4j
public class EncounterUtil {

    @Autowired
    private PlayerUtil playerUtil;

    public List<EncounterResult> parseCsvFileToEncounters(MultipartFile file) {
        List<EncounterResult> encounterResults = new ArrayList<>();

        List<List<String>> records = new ArrayList<>();
        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] values;
            while ((values = csvReader.readNext()) != null) {
                records.add(Arrays.asList(values));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        int i = 1;
        while (true) {
            if (i >= records.size()) {
                break;
            }
            List<String> record = records.get(i);
            String group = record.get(1);
            if (group.equalsIgnoreCase("x")) {
                // No group indicates the end of encounters
                break;
            }

            List<List<String>> groupRecords = new ArrayList<>();
            groupRecords.add(record);
            while (true) {
                i++;
                if (i >= records.size()) {
                    break;
                }
                List<String> line = records.get(i);
                if (group.equalsIgnoreCase(line.get(1))) {
                    groupRecords.add(line);
                } else {
                    break;
                }
            }
            encounterResults.addAll(processGroup(groupRecords));
        }
        return encounterResults;
    }

    private List<EncounterResult> processGroup(List<List<String>> groupRecords) {
        List<EncounterResult> encounterResults = new ArrayList<>();
        // Process set
        for (int set = 0; set < 5; set++) {
            int setCol = 2 + set;

            List<List<String>> sortedSetResult = groupRecords.stream()
                    .filter(e -> !ObjectUtils.isEmpty(e.get(setCol)) && Integer.parseInt(e.get(setCol)) > 0)
                    .sorted(Comparator.comparingInt(e -> Integer.parseInt(e.get(setCol))))
                    .map(e -> List.of(e.getFirst(), e.get(setCol)))
                    .toList();

            if (sortedSetResult.isEmpty()) {
                continue;
            }

            encounterResults.add(processSet(sortedSetResult));
        }

        return encounterResults;
    }

    private EncounterResult processSet(List<List<String>> sortedSetResult) {

        Team team1 = new Team(
                sortedSetResult.get(0).get(0).toLowerCase(),
                sortedSetResult.get(1).get(0).toLowerCase(),
                Integer.parseInt(sortedSetResult.get(0).get(1))
        );

        Team team2 = new Team(
                sortedSetResult.get(2).get(0).toLowerCase(),
                sortedSetResult.get(3).get(0).toLowerCase(),
                Integer.parseInt(sortedSetResult.get(2).get(1))
        );


        return new EncounterResult(team1, team2);
    }
}
