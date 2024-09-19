package com.brs.coordinator_backend.model;

import com.brs.coordinator_backend.dto.EventStatus;
import com.brs.coordinator_backend.dto.EventType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity(name = "Events")
@Table(name = "Events")
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type")
    private EventType eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_schedule_id", referencedColumnName = "id")
    @JsonBackReference
    private EncountersSchedule encountersSchedule;

    @Column(name = "expected_execution_date_time")
    private LocalDateTime expectedExecutionTime;

    @Column(name = "actual_execution_date_time")
    private LocalDateTime actualExecutionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EventStatus eventStatus;
}
