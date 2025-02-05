interface MatchCombination {
  team1: string[];
  team2: string[];
}

export const getMatchCombinations = (players: string[]): MatchCombination[] => {
  if (players.length === 4) {
    const [a, b, c, d] = players;
    return [
      { team1: [a, b], team2: [c, d] }, // AB-CD
      { team1: [a, c], team2: [b, d] }, // AC-BD
      { team1: [a, d], team2: [b, c] }  // AD-BC
    ];
  } else if (players.length === 5) {
    const [a, b, c, d, e] = players;
    return [
      { team1: [a, b], team2: [c, d] }, // AB-CD
      { team1: [a, c], team2: [b, e] }, // AC-BE
      { team1: [a, e], team2: [b, d] }, // AE-BD
      { team1: [a, d], team2: [c, e] }, // AD-CE
      { team1: [b, c], team2: [d, e] }  // BC-DE
    ];
  }
  return [];
};

export type { MatchCombination }; 