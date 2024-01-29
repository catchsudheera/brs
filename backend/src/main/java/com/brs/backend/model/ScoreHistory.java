package com.brs.backend.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * CREATE TABLE SCORE_HISTORY (
 *   id INTEGER PRIMARY KEY AUTO_INCREMENT,
 *   player_id INTEGER NOT NULL,
 *   encounter_id INTEGER NOT NULL,
 *   old_rank_score DOUBLE NOT NULL,
 *   new_rank_score DOUBLE NOT NULL,
 *   mysql_inserted_timestamp TIMESTAMP NOT NULL DEFAULT NOW()
 * );
 */
@Entity(name = "SCORE_HISTORY")
@Table(name = "SCORE_HISTORY")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@ToString
public class ScoreHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "player_id")
    private Integer playerID;
    @Column(name = "encounter_id")
    private Integer encounterId;
    @Column(name = "old_rank_score")
    private Double oldRankScore;
    @Column(name = "new_rank_score")
    private Double newRankScore;
    @Column(name = "player_old_rank")
    private int playerOldRank;
}
