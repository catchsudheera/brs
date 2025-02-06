export interface Player {
  id: number;
  name: string;
  email?: string;
  rankScore: number;
  playerRank: number;
  previousRank: number;
  colorHex: string;
  highestRank: number;
  timeInHighestRank: string;
  active: boolean;
}

export interface PlayerContextType {
  players: Player[];
  loading: boolean;
  error: Error | null;
}
