package com.brs.coordinator_backend.controllers;

import com.brs.coordinator_backend.aws.ServiceClient;
import com.brs.coordinator_backend.aws.dto.PollAnswer;
import com.brs.coordinator_backend.aws.dto.PollStatus;
import com.brs.coordinator_backend.communication.TelegramBotInstance;
import com.brs.coordinator_backend.communication.config.EncounterEvent;
import com.brs.coordinator_backend.communication.config.EncounterEventListConfig;
import com.brs.coordinator_backend.aws.dto.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import kotlin.Pair;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@Slf4j
public class ServerController {

    @Autowired
    private final EncounterEventListConfig appConfig;

    @Autowired
    private final TelegramBotInstance telegramBotInstance;


    @Autowired
    private final ServiceClient serviceClient;


    public ServerController(EncounterEventListConfig appConfig, TelegramBotInstance telegramBotInstance, ServiceClient serviceClient) {
        this.appConfig = appConfig;
        this.telegramBotInstance = telegramBotInstance;
        this.serviceClient = serviceClient;
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

    @GetMapping("/test")
    public String test() throws JsonProcessingException {


        List<User> usersInAGroup = serviceClient.getUsersInAGroup("-4531367864");
        PollStatus pollStatus = serviceClient.getPollStatus("5998980997863965597");
        List<PollAnswer> pollAnswers = serviceClient.getPollAnswers("5998980997863965597");

        log.info("Users : {}", usersInAGroup);
        log.info("Poll Status : {}", pollStatus);
        log.info("Poll Answers : {}", pollAnswers);

        log.info("");
        log.info(" ================================================== ");
        log.info("");


        try {
            serviceClient.getUsersInAGroup("-453136786xxxxxx");
        } catch (RuntimeException ex) {
            log.info("Error {}", ex.getMessage());
        }

        try {
            serviceClient.getPollStatus("5998980997863965597xxxxxx");
        } catch (RuntimeException ex) {
            log.info("Error {}", ex.getMessage());
        }

        try {
            serviceClient.getPollAnswers("5998980997863965597zzzz");
        } catch (RuntimeException ex) {
            log.info("Error {}", ex.getMessage());
        }



        return "ok";
    }
}