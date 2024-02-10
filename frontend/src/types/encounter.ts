export interface EncounterPlayer {
  playerName: string;
  playerId: number;
}

export interface Encounter {
  encounterDate: string;
  encounterId: number;
  encounterScore: number;
  opponentTeam: EncounterPlayer[];
  opponentTeamPoints: number;
  playerTeam: EncounterPlayer[];
  playerTeamPoints: number;
}

export interface EncountersResponse {
  playerName: string;
  playerId: number;
  encounterHistory: Encounter[];
}
