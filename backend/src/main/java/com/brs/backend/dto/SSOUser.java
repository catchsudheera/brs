package com.brs.backend.dto;

import lombok.Getter;

@Getter
public record SSOUser(String email, String firstName, String lastName) {
}
