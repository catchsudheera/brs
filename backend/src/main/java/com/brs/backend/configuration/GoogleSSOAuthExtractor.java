package com.brs.backend.configuration;

import com.brs.backend.util.Constants;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.PublicKey;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@Slf4j
public class GoogleSSOAuthExtractor {

    @Value("${api.admin.emails}")
    private String authenticatedEmailsString;

    @Value("${google.client.id}")
    private String clientId;

    private Set<String> authenticatedEmails;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();

        authenticatedEmails = new HashSet<>();
        if (authenticatedEmailsString == null) {
            log.warn("No list of admin emails provided");
            return;
        }
        for (String email : authenticatedEmailsString.split(",")) {
            authenticatedEmails.add(email.trim().toLowerCase());
        }
    }


    public Optional<Authentication> extract(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader(Constants.API_KEY_HEADER_NAME_GOOGLE_SSO);
            if (authHeader == null || authHeader.isEmpty()) {
                return Optional.empty();
            }

            String idTokenString = sanitizeBearerToken(authHeader);
            log.info("Authneticating for token [{}]", idTokenString);

//            GoogleIdToken idToken = verifier.verify(idTokenString);
            GoogleIdToken idToken = GoogleIdToken.parse(verifier.getJsonFactory(), idTokenString);
            log.info("Got token [{}]", idToken.getPayload());
            boolean verificationResult = verifier.verify(idToken);
            log.info("verificationResult [{}]", verificationResult);

            boolean validated = false;
            for (PublicKey publicKey : verifier.getPublicKeys()) {
                if (idToken.verifySignature(publicKey)) {
                    validated = true;
                    break;
                }
            }
            log.info("validation result {}", validated);
            log.info("id token returned: {}", idToken);
            if (idToken == null) {
                log.error("Invalid ID token");
                return Optional.empty();
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            boolean emailVerified = payload.getEmailVerified();

            log.info("Authenticating user with email: {}", email);

            if (!emailVerified) {
                log.error("Email not verified");
                return Optional.empty();
            }

            if (authenticatedEmails.contains(email.toLowerCase())) {
                return Optional.of(new ApiKeyAuth(idTokenString, AuthorityUtils.NO_AUTHORITIES));
            } else {
                log.error("Email not in authorized list");
                return Optional.empty();
            }

        } catch (Exception e) {
            log.error("Error verifying Google token", e);
            return Optional.empty();
        }
    }


    private String sanitizeBearerToken(String bearerToken) {
        return bearerToken.replace("Bearer ", "").trim();
    }

}