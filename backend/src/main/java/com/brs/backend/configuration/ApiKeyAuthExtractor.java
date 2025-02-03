package com.brs.backend.configuration;

import com.brs.backend.common.AuthEmailProvider;
import com.brs.backend.dto.AccessLevel;
import com.brs.backend.util.Constants;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ApiKeyAuthExtractor {

    @Value("${api.key}")
    private String apiKey;

    @Autowired
    private AuthEmailProvider authEmailProvider;

    public Optional<Authentication> extract(HttpServletRequest request) {
        String providedKey = request.getHeader(Constants.API_KEY_HEADER_NAME);
        if (providedKey == null || !providedKey.equals(apiKey))
            return Optional.empty();

        return Optional.of(new ApiKeyAuth(providedKey, AccessLevel.ADMIN,
                authEmailProvider.getAuthenticatedEmails().stream().findFirst().orElse(null),
                AuthorityUtils.NO_AUTHORITIES));
    }

}