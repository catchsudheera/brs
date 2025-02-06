package com.brs.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlayerInfo {
    private Integer id;
    private String name;
    private Double rankScore;
    private  Integer playerRank;
    private Integer previousRank;
    private String colorHex;
    private Integer highestRank;
    private String timeInHighestRank;
    private boolean active;
}