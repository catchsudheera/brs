package com.brs.backend.configuration;

import com.brs.backend.common.AuthEmailProvider;
import com.brs.backend.dto.AccessLevel;
import com.brs.backend.util.Constants;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;

@Component
@Slf4j
public class GoogleSSOAuthExtractor {


    @Value("${google.client.id}")
    private String clientId;

    @Autowired
    private AuthEmailProvider authEmailProvider;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }


    public Optional<Authentication> extract(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader(Constants.API_KEY_HEADER_NAME_GOOGLE_SSO);
            if (authHeader == null || authHeader.isEmpty()) {
                return Optional.empty();
            }

            String idTokenString = sanitizeBearerToken(authHeader);
            GoogleIdToken idToken = verifier.verify(idTokenString);
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

            if (authEmailProvider.getAuthenticatedEmails().contains(email.toLowerCase())) {
                return Optional.of(new ApiKeyAuth(idTokenString, AccessLevel.ADMIN, email.toLowerCase(), AuthorityUtils.NO_AUTHORITIES));
            } else {
                if (request.getRequestURI().equals("/v2/auth")) {
                    log.error("Email not in admin list");
                    return Optional.of(new ApiKeyAuth(idTokenString, AccessLevel.USER, email.toLowerCase(), AuthorityUtils.NO_AUTHORITIES));
                } else {
                    log.error("Email not valid admin email");
                    return Optional.empty();
                }

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