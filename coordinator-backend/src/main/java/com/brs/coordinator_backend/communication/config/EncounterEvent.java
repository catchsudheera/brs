package com.brs.coordinator_backend.communication.config;

public record EncounterEvent(String name,
                             ChatBot chatBot,
                             ChatGroup memberGroup,
                             ChatGroup openSlotGroup,
                             ChatGroup adminGroup,
                             String cron,
                             int totalSlots) {
}
