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
  // Mark all players from /players endpoint as active
  return players.map((player: Player) => ({
    ...player,
    isActive: true
  }));
};

export const getInactivePlayers = async (): Promise<Player[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/inactive`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch inactive players');
  }
  
  const players = await response.json();
  // Mark all players from /players/inactive endpoint as inactive
  return players.map((player: Player) => ({
    ...player,
    isActive: false
  }));
}; 