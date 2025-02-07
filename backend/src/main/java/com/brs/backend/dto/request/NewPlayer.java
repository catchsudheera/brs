package com.brs.backend.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

@Data
@JsonSerialize
public class NewPlayer {
    private String name;
    private Integer initialScore;
    private String email;
}
