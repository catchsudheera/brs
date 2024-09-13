package com.brs.coordinator_backend.communication;

public interface chatApp {

    void createPoll();
    void closePoll();
    void getPollState(String referenceId);

    void sendPM(String message, String receiver);
    void sendGroupMessage(String message, String groupId);

}
