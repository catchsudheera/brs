package com.brs.coordinator_backend.communication.config;

public record EncounterEvent(ChatBot chatBot,
                             ChatGroup memberGroup,
                             ChatGroup openSlotGroup,
                             ChatGroup adminGroup,
                             String cron) {
}
