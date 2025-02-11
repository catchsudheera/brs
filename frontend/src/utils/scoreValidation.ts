export const isValidMatchScore = (team1Score: number, team2Score: number): boolean => {
  const maxPoints = 30;
  const minWinningPoints = 21;
  const minLead = 2;

  if (team1Score === team2Score) {
    return false;
  }

  if (team1Score < 0 || team2Score < 0 || team1Score > maxPoints || team2Score > maxPoints) {
    return false;
  }

  if (team1Score === maxPoints || team2Score === maxPoints) {
    return (team1Score === maxPoints && team2Score >= 28) || (team2Score === maxPoints && team1Score >= 28);
  }

  if (team1Score >= 22 || team2Score >= 22) {
    if ((team1Score - team2Score) != 2 && (team2Score - team1Score) != 2) {
      return false;
    }
  }

  if (team1Score >= minWinningPoints || team2Score >= minWinningPoints) {
    if (Math.abs(team1Score - team2Score) >= minLead) {
      return true;
    }
  }

  return false;
}; 
