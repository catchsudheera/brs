package com.brs.backend.services;

import com.pengrad.telegrambot.TelegramBot;
import com.pengrad.telegrambot.request.SendPoll;
import com.pengrad.telegrambot.response.SendResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.TemporalAdjusters;

@Service
@Slf4j
public class EncounterScheduler {

    @Value("${api.tg.key}")
    private String botKey;

    @Value("${api.tg.group_id}")
    private String groupId;

    @Scheduled(cron = "0 0 15 * * MON")
    public void scheduleEncounter() {
        LocalDate nextWednesday = getNextWednesday();
        TelegramBot bot = new TelegramBot(botKey);
        SendPoll poll = new SendPoll(groupId, "Joining Badminton on " + nextWednesday, "In", "Out");
        poll.allowsMultipleAnswers(false);
        poll.isAnonymous(false);
        SendResponse pollResponse = bot.execute(poll);
    }

    private LocalDate getNextWednesday() {
        LocalDate ld = LocalDate.now();
        return ld.with(TemporalAdjusters.next(DayOfWeek.WEDNESDAY));
    }

}
