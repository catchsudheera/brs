import type { Encounter } from '@/types/encounter';

export const getEncounterHistory = async (
  teamA1: number,
  teamA2: number,
  teamB1: number,
  teamB2: number
): Promise<Encounter[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/encounters-for-players?teamAp1=${teamA1}&teamAp2=${teamA2}&teamBp1=${teamB1}&teamBp2=${teamB2}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch encounter history');
  }
  
  return response.json();
}; 