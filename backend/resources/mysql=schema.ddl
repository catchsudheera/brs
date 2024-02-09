-- brs.ENCOUNTER definition

CREATE TABLE `ENCOUNTER` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_1` varchar(32) NOT NULL,
  `team_2` varchar(32) NOT NULL,
  `encounter_date` date NOT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  `team_1_set_points` int NOT NULL,
  `team_2_set_points` int NOT NULL,
  `calculated_score` double DEFAULT NULL,
  `color_hex` varchar(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_uniqness` (`team_1`,`team_2`,`encounter_date`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- brs.PLAYER definition

CREATE TABLE `PLAYER` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `rank_score` double NOT NULL DEFAULT '1000',
  `player_rank` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- brs.SCORE_HISTORY definition

CREATE TABLE `SCORE_HISTORY` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `encounter_id` int NOT NULL,
  `old_rank_score` double NOT NULL,
  `new_rank_score` double NOT NULL,
  `mysql_inserted_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `player_old_rank` int DEFAULT NULL,
  `player_new_rank` int DEFAULT NULL,
  `encounter_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;