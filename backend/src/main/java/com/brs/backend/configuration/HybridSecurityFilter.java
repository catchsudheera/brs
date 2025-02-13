package com.brs.backend.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HybridSecurityFilter extends OncePerRequestFilter {

    private final ApiKeyAuthExtractor apiKeyExtractor;
    private final GoogleSSOAuthExtractor googleSSOAuthExtractor;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/v2")) {
            Optional<Authentication> googleAuth = googleSSOAuthExtractor.extract(request);
            if (googleAuth.isPresent()) {
                SecurityContextHolder.getContext().setAuthentication(googleAuth.get());
            } else {
                apiKeyExtractor.extract(request)
                        .ifPresent(SecurityContextHolder.getContext()::setAuthentication);
            }
        } else {
            apiKeyExtractor.extract(request)
                    .ifPresent(SecurityContextHolder.getContext()::setAuthentication);
        }
        filterChain.doFilter(request, response);
    }
}