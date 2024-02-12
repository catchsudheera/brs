package com.brs.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity(name="PLAYER")
@Table(name = "PLAYER")
@RequiredArgsConstructor
@Getter
@Setter
@ToString
//@NoArgsConstructor
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    @Column(name = "rank_score")
    private Double rankScore;
    @Column(name = "player_rank")
    private Integer playerRank;
    @Column(name = "color_hex")
    private String colorHex;
    @Column(name = "highest_rank")
    private Integer highestRank;
    @Column(name = "rank_since")
    private LocalDate rankSince;
}
