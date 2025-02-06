export interface MatchScore {
  team1Score: number;
  team2Score: number;
  submitted?: boolean;
}

export interface Game {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  groups: Record<string, number[]>;
  scores: Record<string, Record<string, { team1Score: number; team2Score: number }>>;
}

export interface PlayerMatch {
  gameId: string;
  groupName: string;
  matchIndex: number;
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isPlayerInTeam1: boolean;
  createdAt: Date;
}

export interface GameWithMatches {
  id: string;
  createdAt: Date;
  matches: PlayerMatch[];
} 