package com.brs.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SecurePlayerInfo extends PlayerInfo {

    private String email;

    public SecurePlayerInfo(Integer id, String name, Double rankScore, Integer playerRank, Integer previousRank, String colorHex, Integer highestRank, String timeInHighestRank, PlayerStatus playerStatus, String email) {
        super(id, name, rankScore, playerRank, previousRank, colorHex, highestRank, timeInHighestRank, playerStatus);
        this.email = email;
    }
}
