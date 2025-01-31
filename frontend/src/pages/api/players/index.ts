import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlayers } from '@/services/playerService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const players = await getPlayers();
    res.status(200).json(players);
  } catch (error) {
    console.error('Players API Error:', error);
    res.status(500).json({ message: 'Failed to fetch players' });
  }
} 