import type { Player } from '@/types/player';
import { capitalizeFirstLetter } from '@/utils/string';

export const getPlayers = async (): Promise<Player[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/players`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }
  
  const players = await response.json();
  // Sort the players by id ascending
  const sortedPlayers = players.sort((a: Player, b: Player) => a.id - b.id);
  return sortedPlayers.map((player: Player) => ({
    ...player
  }));
};

export const getInactivePlayers = async (): Promise<Player[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/players?status=inactive`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch inactive players');
  }
  
  const players = await response.json();
  return players.map((player: Player) => ({
    ...player
  }));
}; 