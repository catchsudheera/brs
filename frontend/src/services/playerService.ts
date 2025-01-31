import { Player } from '@/types/player';

export const getPlayers = async (): Promise<Player[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/players`);
  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }
  return response.json();
}; 