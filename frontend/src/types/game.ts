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