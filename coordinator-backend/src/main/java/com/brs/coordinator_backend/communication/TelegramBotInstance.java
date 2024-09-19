package com.brs.coordinator_backend.communication;

import com.brs.coordinator_backend.communication.config.ChatBot;
import com.brs.coordinator_backend.communication.config.ChatGroup;
import com.pengrad.telegrambot.TelegramBot;
import com.pengrad.telegrambot.model.Poll;
import com.pengrad.telegrambot.model.Update;
import com.pengrad.telegrambot.model.request.InputPollOption;
import com.pengrad.telegrambot.request.GetUpdates;
import com.pengrad.telegrambot.request.SendMessage;
import com.pengrad.telegrambot.request.SendPoll;
import com.pengrad.telegrambot.request.StopPoll;
import com.pengrad.telegrambot.response.GetUpdatesResponse;
import com.pengrad.telegrambot.response.PollResponse;
import com.pengrad.telegrambot.response.SendResponse;
import kotlin.Pair;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;


@Component
@Slf4j
public class TelegramBotInstance implements ChatBotContract {

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public Pair<Integer, String> createPoll(ChatBot sender, ChatGroup group, String pollSubject, String[] options) {
        TelegramBot bot = new TelegramBot(sender.token());

        InputPollOption[] array = Arrays.stream(options).map(InputPollOption::new).toList().toArray(new InputPollOption[]{});
        SendPoll request = new SendPoll(group.groupId(), pollSubject, array)
                .isAnonymous(false)
                .allowsMultipleAnswers(false);

        // Send the poll and get the response
        SendResponse response = bot.execute(request);

        // Check if the poll was sent successfully
        if (response.isOk()) {
            Integer messageId = response.message().messageId();
            String pollId = response.message().poll().id();

            log.info("Poll posted successfully. Poll Message ID: {}", messageId);
            return new Pair<>(messageId, pollId);
        } else {
            log.error("Failed to post poll: {}", response.description());
            throw new RuntimeException("Failed to post the poll : " + response.description());
        }
    }

    @Override
    public void closePoll(ChatBot sender, ChatGroup group, Integer messageId) {
        StopPoll request = new StopPoll(group.groupId(), messageId);
        TelegramBot bot = new TelegramBot(sender.token());
        PollResponse response = bot.execute(request);

        // Check if the poll was closed successfully
        if (response.isOk()) {
            Poll poll = response.poll();
            log.info("Poll closed successfully. Poll ID: {}", poll.id());

        } else {
            log.error("Failed to close poll: {}", response.description());
        }
    }

    @Override
    public void getPollState(ChatBot sender, ChatGroup group, String pollId) {
        // TODO configure following
        // TODO Add DTO class for pollState
        String pollStateStr = restTemplate.getForObject("https://wzn6683ql5.execute-api.eu-central-1.amazonaws.com/prod/telegram-poll-webhook-persist?pollId=" + pollId, String.class);
        log.info("Poll state : {}", pollStateStr);
    }

    @Override
    public void sendPM(String message, String receiver) {

    }

    @Override
    public void sendGroupMessage(ChatBot sender, ChatGroup group, String message) {
        TelegramBot bot = new TelegramBot(sender.token());
        SendMessage request = new SendMessage(group.groupId(), message);

        SendResponse response = bot.execute(request);

        if (response.isOk()) {
            log.info("Message sent successfully.");
        } else {
            log.error("Failed to send message: {}", response.description());
        }

    }
}
