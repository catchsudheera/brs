import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  if (!(await requireAuth(req, res))) {
    return;
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid game ID' });
  }

  try {
    const game = await prisma.game.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS'
      }
    });

    res.status(200).json(game);
  } catch (error) {
    console.error('Start Game API Error:', error);
    res.status(500).json({ message: 'Failed to start game' });
  }
} 