package com.brs.backend.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

@Data
@JsonSerialize
public class UpdatePlayer {

    private Integer id;
    private String name;
    private String email;
}
