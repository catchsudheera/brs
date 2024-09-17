package com.brs.coordinator_backend.aws.dto;

public record User(String id, boolean isBot, String firstName, String lastName, String username, String languageCode) {
}
