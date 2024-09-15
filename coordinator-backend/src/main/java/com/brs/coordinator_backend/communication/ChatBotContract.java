package com.brs.coordinator_backend.communication;

import com.brs.coordinator_backend.communication.config.ChatBot;
import com.brs.coordinator_backend.communication.config.ChatGroup;
import kotlin.Pair;

public interface ChatBotContract {

    Pair<Integer, String> createPoll(ChatBot sender, ChatGroup group, String pollSubject, String[] options);
    void closePoll(ChatBot sender, ChatGroup group, Integer messageId);
    void getPollState(ChatBot sender, ChatGroup group, String pollId);

    void sendPM(String message, String receiver);
    void sendGroupMessage(ChatBot sender, ChatGroup group, String message);

}
