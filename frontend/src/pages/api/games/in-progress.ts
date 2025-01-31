import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const games = await prisma.game.findMany({
      where: {
        status: 'IN_PROGRESS'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate progress for each game
    const gamesWithProgress = games.map(game => {
      const scores = game.scores as Record<string, Record<string, { team1Score: number; team2Score: number }>>;
      const groups = game.groups as Record<string, number[]>;
      
      let totalMatches = 0;
      let completedMatches = 0;

      Object.entries(groups).forEach(([groupName]) => {
        const groupScores = scores[groupName] || {};
        Object.values(groupScores).forEach(score => {
          totalMatches++;
          if (score.team1Score > 0 || score.team2Score > 0) {
            completedMatches++;
          }
        });
      });

      return {
        ...game,
        progress: totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0
      };
    });

    res.status(200).json(gamesWithProgress);
  } catch (error) {
    console.error('Fetch In-Progress Games API Error:', error);
    res.status(500).json({ message: 'Failed to fetch in-progress games' });
  }
} 