export const isValidPlayerCount = (count: number) => {
  const MIN_PLAYERS = 4;
  const MAX_PLAYERS = 20;
  const MAX_GROUPS = 4;
  const MIN_GROUP_SIZE = 4;
  const MAX_GROUP_SIZE = 5;

  if (count < MIN_PLAYERS || count > MAX_PLAYERS) return false;
  
  for (let numGroups = 1; numGroups <= MAX_GROUPS; numGroups++) {
    const minPlayersNeeded = numGroups * MIN_GROUP_SIZE;
    const maxPlayersNeeded = numGroups * MAX_GROUP_SIZE;
    if (count >= minPlayersNeeded && count <= maxPlayersNeeded) {
      return true;
    }
  }
  return false;
}; 