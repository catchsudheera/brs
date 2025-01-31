import { Player } from '@/types/player';
import { capitalizeFirstLetter } from '@/utils/string';

export const getPlayers = async (): Promise<Player[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/players`);
  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }
  const players = await response.json();
  
  // Capitalize player names before returning
  return players.map((player: Player) => ({
    ...player,
    name: capitalizeFirstLetter(player.name)
  }));
}; 