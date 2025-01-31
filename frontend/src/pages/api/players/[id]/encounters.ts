import type { NextApiRequest, NextApiResponse } from 'next';
import { groupBy, sumBy } from '@/utils/string';
import type { Encounter } from '@/types/encounter';

interface EncountersStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface EnhancedEncountersResponse {
  stats: EncountersStats;
  encountersByDate: Record<string, Encounter[]>;
  scoreSumByDate: Record<string, number>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnhancedEncountersResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${id}/encounters`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch encounters');
    }

    const data = await response.json();
    const encounters = data.encounterHistory;

    // Calculate stats
    const totalGames = encounters.length;
    const wins = encounters.filter((e: Encounter) => e.playerTeamPoints > e.opponentTeamPoints).length;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? (wins / totalGames * 100) : 0;

    // Group encounters by date
    const encountersByDate = groupBy(
      encounters,
      (encounter: Encounter) => encounter.encounterDate
    );

    // Calculate score sums by date
    const scoreSumByDate = sumBy(
      encounters,
      (encounter: Encounter) => encounter.encounterDate
    );

    const enhancedResponse: EnhancedEncountersResponse = {
      stats: {
        totalGames,
        wins,
        losses,
        winRate
      },
      encountersByDate,
      scoreSumByDate
    };

    res.status(200).json(enhancedResponse);
  } catch (error) {
    console.error('Encounters API Error:', error);
    res.status(500).json({ message: 'Failed to fetch encounters' });
  }
} 