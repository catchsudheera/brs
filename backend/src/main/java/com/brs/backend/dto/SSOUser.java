package com.brs.backend.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@Getter
@FieldDefaults(makeFinal=true, level= AccessLevel.PRIVATE)
public class SSOUser {

    String email;
    String firstName;
    String lastName;
}
