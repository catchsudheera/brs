import { getPlayers } from '@/services/playerService';
import type { NextApiRequest, NextApiResponse } from 'next';

interface RankingStats {
  totalPlayers: number;
  topScore: number;
  averageScore: number;
}

interface PlayerRankingData {
  id: number;
  name: string;
  playerRank: number;
  previousRank: number;
  rankScore: number;
  highestRank: number;
  timeInHighestRank: string;
  rankChange: {
    direction: 'up' | 'down' | 'none';
    amount: number;
  };
  isAboveAverage: boolean;
  active: boolean;
}

interface RankingsResponse {
  stats: RankingStats;
  players: PlayerRankingData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const players = await getPlayers();
    
    // Calculate stats
    const totalPlayers = players.length;
    const topScore = Math.max(...players.map(p => p.rankScore));
    const averageScore = players.reduce((acc, p) => acc + p.rankScore, 0) / totalPlayers;

    // Process player data
    const enrichedPlayers = players
      .map(player => {
        const rankChange = player.previousRank - player.playerRank;
        return {
          id: player.id,
          name: player.name,
          playerRank: player.playerRank,
          previousRank: player.previousRank,
          rankScore: player.rankScore,
          highestRank: player.highestRank,
          timeInHighestRank: player.timeInHighestRank.replace('(', '').replace(')', ''),
          rankChange: {
            direction: rankChange > 0 ? 'up' : rankChange < 0 ? 'down' : 'none',
            amount: Math.abs(rankChange)
          },
          isAboveAverage: player.rankScore > averageScore,
          active: player.active
        };
      })
      .sort((a, b) => a.playerRank - b.playerRank);

    const response: RankingsResponse = {
      stats: {
        totalPlayers,
        topScore,
        averageScore
      },
      players: enrichedPlayers as PlayerRankingData[]
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Rankings API Error:', error);
    res.status(500).json({ message: 'Failed to fetch rankings' });
  }
} 