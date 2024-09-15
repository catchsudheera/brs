package com.brs.coordinator_backend.controllers;

import com.brs.coordinator_backend.communication.TelegramBotInstance;
import com.brs.coordinator_backend.communication.config.EncounterEvent;
import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import kotlin.Pair;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class ServerController {

    @Autowired
    private final EncounterEventListConfig appConfig;

    @Autowired
    private TelegramBotInstance telegramBotInstance;

    public ServerController(EncounterEventListConfig appConfig, TelegramBotInstance telegramBotInstance) {
        this.appConfig = appConfig;
        this.telegramBotInstance = telegramBotInstance;
    }


    @GetMapping("/servers")
    public EncounterEventListConfig getServers() throws InterruptedException {
        log.info("-- {}", appConfig);
        EncounterEvent wedEncounter = appConfig.encounterEvents().getFirst();
//        telegramBotInstance.sendGroupMessage(wedEncounter.chatBot(), wedEncounter.memberGroup(), "Poll starting for you members");
//        telegramBotInstance.sendGroupMessage(wedEncounter.chatBot(), wedEncounter.adminGroup(), "admin : Poll started");
//        telegramBotInstance.sendGroupMessage(wedEncounter.chatBot(), wedEncounter.openSlotGroup(), "Poll started for group members");


        Pair<Integer, String> pollIds = telegramBotInstance.createPoll(wedEncounter.chatBot(), wedEncounter.memberGroup(), "New Poll", new String[]{"Yes", "No"});
        log.info("poll ids : {}", pollIds);

        for (int i = 0; i < 3; i++) {
            log.info(" -- waiting for 20 seconds..");
            Thread.sleep(10000);
            telegramBotInstance.getPollState(wedEncounter.chatBot(), wedEncounter.memberGroup(), pollIds.getSecond());
        }


        log.info(" -- waiting for 10 seconds. And then poll closing...");
        Thread.sleep(10000);
        telegramBotInstance.closePoll(wedEncounter.chatBot(), wedEncounter.memberGroup(), pollIds.getFirst());


        return appConfig;
    }
}