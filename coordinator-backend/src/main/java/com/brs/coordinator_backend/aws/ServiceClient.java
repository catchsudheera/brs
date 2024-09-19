package com.brs.coordinator_backend.aws;

import com.brs.coordinator_backend.aws.dto.PollAnswer;
import com.brs.coordinator_backend.aws.dto.PollStatus;
import com.brs.coordinator_backend.aws.dto.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@Slf4j
public class ServiceClient {

    @Value("${aws.api.gateway.resource-url}")
    private String rootUrl;

    @Autowired
    private final RestTemplate restTemplate;

    @Autowired
    private final ObjectMapper objectMapper;

    public ServiceClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }


    public List<User> getUsersInAGroup(String groupId) throws JsonProcessingException {

        ResponseEntity<String> response = restTemplate.exchange(
                rootUrl + "/telegram-group-users?groupId=" + groupId, HttpMethod.GET, null, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return objectMapper.readValue(response.getBody(), new TypeReference<>() {});
        }

        log.info("Request failed: {}", response);
        //TODO drop a message to admin group
        throw new RuntimeException("REST call failed to AWS resource : " + response.getBody());

    }

    public PollStatus getPollStatus(String pollId) throws JsonProcessingException {
        ResponseEntity<String> response = restTemplate.exchange(
                rootUrl + "/telegram-poll-webhook-persist?pollId=" + pollId, HttpMethod.GET, null, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return objectMapper.readValue(response.getBody(), new TypeReference<>() {});
        }

        log.info("Request failed: {}", response);

        //TODO drop a message to admin group
        throw new RuntimeException("REST call failed to AWS resource : " + response.getBody());
    }

    public List<PollAnswer> getPollAnswers(String pollId) throws JsonProcessingException {
        ResponseEntity<String> response = restTemplate.exchange(
                rootUrl + "/telegram-poll-answer?pollId=" + pollId, HttpMethod.GET, null, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return objectMapper.readValue(response.getBody(), new TypeReference<>() {});
        }

        log.info("Request failed: {}", response);

        //TODO drop a message to admin group
        throw new RuntimeException("REST call failed to AWS resource : " + response.getBody());
    }

}
