package com.brs.coordinator_backend.model;

import com.brs.coordinator_backend.dto.EncounterEventScheduleStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Set;
import lombok.*;

@Entity(name = "ENCOUNTERS_SCHEDULES")
@Table(name = "ENCOUNTERS_SCHEDULES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncountersSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "date")
    private LocalDate encounterScheduleDate;

    @Column(name = "encounter_event")
    private String encounterEvent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EncounterEventScheduleStatus encounterEventScheduleStatus;

    @Column(name = "encounter_data", columnDefinition = "json")
    @Convert(attributeName = "encounter_data", converter = JsonToObjectConverter.class)
    private EncounterScheduleProperties encounterScheduleProperties;

    @OneToMany(mappedBy = "encountersSchedule", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<Event> events;
}
