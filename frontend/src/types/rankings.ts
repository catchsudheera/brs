export interface RankingStats {
  totalPlayers: number;
  topScore: number;
  averageScore: number;
}

export interface PlayerRankingData {
  id: number;
  name: string;
  playerRank: number;
  previousRank: number;
  rankScore: number;
  highestRank: number;
  timeInHighestRank: string;
  rankChange: {
    direction: 'up' | 'down' | 'none';
    amount: number;
  };
  isAboveAverage: boolean;
}

export interface RankingsResponse {
  stats: RankingStats;
  players: PlayerRankingData[];
} 