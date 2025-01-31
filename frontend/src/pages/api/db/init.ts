import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Add any initial data setup here if needed
    res.status(200).json({ message: 'Database initialized' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize database' });
  }
} 