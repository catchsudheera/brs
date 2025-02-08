import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/game/players`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch game players');
    }

    const players = await response.json();
    res.status(200).json(players);
  } catch (error) {
    console.error('Game Players API Error:', error);
    res.status(500).json({ message: 'Failed to fetch game players' });
  }
} 