package com.brs.backend.model;

import com.brs.backend.dto.PlayerStatus;
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
    @Column(name = "player_status")
    @Enumerated(EnumType.STRING)
    private PlayerStatus status;
    @Column(name = "email")
    private String email;


    public boolean isAvailableForGame(){
        return status != PlayerStatus.DISABLED;
    }

    public boolean isActive (){
        return status == PlayerStatus.ACTIVE;
    }

    public boolean isDisabled(){
        return status == PlayerStatus.DISABLED;
    }

}
