export interface PlayerHistoryEntry {
  date: string;
  oldRank: number;
  newRank: number;
}

export interface PlayerHistory {
  playerName: string;
  playerId: number;
  history: PlayerHistoryEntry[];
}

export interface GraphData {
  date: string;
  [key: string]: string | number;
}
