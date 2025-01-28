export interface SelectedMatch {
  groupName: string;
  matchIndex: number;
  team1: string[];
  team2: string[];
}

export interface MatchScore {
  team1Score: number;
  team2Score: number;
}

export interface GroupScores {
  [matchIndex: number]: MatchScore;
}

export interface AllScores {
  [groupName: string]: GroupScores;
} 