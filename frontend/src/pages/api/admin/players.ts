import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { status } = req.query;
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/auth/players?status=${status}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch players');
    }

    const players = await response.json();
    res.status(200).json(players);
  } catch (error) {
    console.error('Admin Players API Error:', error);
    res.status(500).json({ message: 'Failed to fetch players' });
  }
} 