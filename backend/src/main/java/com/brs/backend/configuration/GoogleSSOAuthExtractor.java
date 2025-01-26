package com.brs.backend.configuration;

import com.brs.backend.services.GoogleSSOService;
import com.brs.backend.util.Constants;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class GoogleSSOAuthExtractor {

    @Autowired
    private GoogleSSOService googleSSOService;

    @Value("${api.admin-emails}")
    private String authenticatedEmailsString;

    private Set<String> authenticatedEmails;

    @PostConstruct
    public void init() {
        if (authenticatedEmailsString != null) {
            return;
        }
        authenticatedEmails = new HashSet<>();
        for (String email : authenticatedEmailsString.split(",")) {
            authenticatedEmails.add(email.trim().toLowerCase());
        }
    }


    public Optional<Authentication> extract(HttpServletRequest request) {
        String providedKey = request.getHeader(Constants.API_KEY_HEADER_NAME_GOOGLE_SSO);
        if(providedKey == null || providedKey.isEmpty()) {
            return Optional.empty();
        }
        var ssoUser = googleSSOService.getProfileDetailsGoogle(providedKey);
        if(ssoUser == null) {
            return Optional.empty();
        }
        if(authenticatedEmails.contains(ssoUser.getEmail().toLowerCase())) {
            return Optional.of(new ApiKeyAuth(providedKey, AuthorityUtils.NO_AUTHORITIES));
        }
        return Optional.empty();
    }

}