import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication first
  if (!(await requireAuth(req, res))) {
    return;
  }

  if (req.method === 'POST') {
    try {
      const { groups } = req.body;
      const game = await prisma.game.create({
        data: {
          groups,
          status: 'DRAFT'
        }
      });
      res.status(201).json(game);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create game' });
    }
  } else if (req.method === 'GET') {
    try {
      const games = await prisma.game.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.status(200).json(games);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch games' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 