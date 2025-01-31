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

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid game ID' });
  }

  if (req.method === 'GET') {
    try {
      const game = await prisma.game.findUnique({
        where: { id }
      });
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch game' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { groups, scores, status } = req.body;
      const game = await prisma.game.update({
        where: { id },
        data: {
          groups,
          scores,
          status
        }
      });
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update game' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.game.delete({
        where: { id }
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete game' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 