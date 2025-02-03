package com.brs.backend.configuration;

import com.brs.backend.dto.AccessLevel;
import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class ApiKeyAuth extends AbstractAuthenticationToken {

    private final String apiKey;

    @Getter
    private final AccessLevel accessLevel;

    @Getter
    private final String loggedInEmail;

    public ApiKeyAuth(String apiKey, AccessLevel accessLevel, String loggedInEmail,
                      Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.apiKey = apiKey;
        this.accessLevel = accessLevel;
        this.loggedInEmail = loggedInEmail;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return apiKey;
    }

}