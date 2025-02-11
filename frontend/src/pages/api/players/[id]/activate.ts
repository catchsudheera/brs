import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await requireAuth(req, res);
  if (!session) return;

  const { id } = req.query;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/players/${id}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate player');
    }

    res.status(200).json({ message: 'Player activated successfully' });
  } catch (error) {
    console.error('Activate Player API Error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to activate player' 
    });
  }
} 