package com.brs.backend.dto;

import lombok.*;

@AllArgsConstructor
@Setter
@Getter
@EqualsAndHashCode
public abstract class PlayerHistory {
    private String playerName;
    private Integer playerId;
}
