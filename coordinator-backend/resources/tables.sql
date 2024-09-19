CREATE TABLE `ENCOUNTERS_SCHEDULES` (
    `id` int NOT NULL AUTO_INCREMENT,
    `date` date NOT NULL,
    `encounter_event` varchar(50) NOT NULL,
    `status` varchar(36) NOT NULL,
    `encounter_data` JSON DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `enc_schedule_unique` (`date`,`encounter_event`),
    index `status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `EVENTS` (
    `id` int NOT NULL AUTO_INCREMENT,
    `event_type` varchar(50) NOT NULL,
    `encounter_schedule_id` int NOT NULL,
    `expected_execution_date_time` datetime NOT NULL,
    `actual_execution_date_time` datetime default NULL,
    `status` varchar(36) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `enc_sch_event_unique` (`event_type`,`encounter_schedule_id`),
    index `status_index` (`status`),
    index `expected_execution_index` (`expected_execution_date_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

