import type { NextApiRequest, NextApiResponse } from 'next';
import { getEncounterHistory } from '@/services/encounterHistoryService';
import type { Encounter } from '@/types/encounter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Encounter[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { teamA1, teamA2, teamB1, teamB2 } = req.query;

  try {
    const data = await getEncounterHistory(
      Number(teamA1), 
      Number(teamA2), 
      Number(teamB1), 
      Number(teamB2)
    );
    res.status(200).json(data);
  } catch (error) {
    console.error('Encounter History API Error:', error);
    res.status(500).json({ message: 'Failed to fetch encounter history' });
  }
} 