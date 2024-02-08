package com.brs.backend.dto;

public record PlayerInfo(Integer id, String name, Double rankScore, Integer playerRank, Integer previousRank, String colorHex) {
}