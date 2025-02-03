export interface Player {
  id: number;
  name: string;
  rankScore: number;
  playerRank: number;
  previousRank: number;
  colorHex: string;
  highestRank: number;
  timeInHighestRank: string;
  isActive: boolean;
}

export interface PlayerContextType {
  players: Player[];
  loading: boolean;
  error: Error | null;
}
