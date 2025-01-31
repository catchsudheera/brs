import type { NextApiRequest, NextApiResponse } from 'next';
import { getRankingHistory } from '@/services/rankingHistoryService';
import type { RankingHistoryData } from '@/types/rankings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RankingHistoryData[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getRankingHistory();
    res.status(200).json(data);
  } catch (error) {
    console.error('Ranking History API Error:', error);
    res.status(500).json({ message: 'Failed to fetch ranking history' });
  }
} 