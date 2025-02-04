package com.brs.backend.common;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class AuthEmailProvider {

    @Value("${api.admin.emails}")
    private String authenticatedEmailsString;

    @PostConstruct
    public void init() {

        authenticatedEmails = new HashSet<>();
        if (authenticatedEmailsString == null) {
            log.warn("No list of admin emails provided");
            return;
        }
        for (String email : authenticatedEmailsString.split(",")) {
            authenticatedEmails.add(email.trim().toLowerCase());
        }
    }

    @Getter
    private Set<String> authenticatedEmails;
}
