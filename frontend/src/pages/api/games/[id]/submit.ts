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
  const session = await requireAuth(req, res);
  if (!session) return;

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid game ID' });
  }

  try {
    // Get game from database
    const game = await prisma.game.findUnique({
      where: { id }
    });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Submit each match result to external API
    const scores = game.scores as Record<string, Record<string, { team1Score: number; team2Score: number; submitted?: boolean }>>;
    const groups = game.groups as Record<string, number[]>;
    let updatedScores = { ...scores };
    let hasErrors = false;
    const errors: Array<{ group: string; match: string; error: string }> = [];

    for (const [groupName, groupScores] of Object.entries(scores)) {
      updatedScores[groupName] = { ...groupScores };
      
      for (const [matchIndex, score] of Object.entries(groupScores)) {
        if (score.team1Score === 0 && score.team2Score === 0) continue;
        if (score.submitted) continue;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/encounters/${id}/add`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`,
              },
              body: JSON.stringify({
                team1: {
                  player1: groups[groupName][0],
                  player2: groups[groupName][1],
                  setPoints: score.team1Score
                },
                team2: {
                  player1: groups[groupName][2],
                  player2: groups[groupName][3],
                  setPoints: score.team2Score
                }
              })
            }
          );

          if (response.ok) {
            // Mark individual score as submitted on success
            updatedScores[groupName][matchIndex] = {
              ...score,
              submitted: true
            };

            // Save progress after each successful submission
            await prisma.game.update({
              where: { id },
              data: { scores: updatedScores }
            });
          } else {
            hasErrors = true;
            errors.push({
              group: groupName,
              match: matchIndex,
              error: `Failed with status: ${response.status}`
            });
          }
        } catch (error) {
          hasErrors = true;
          errors.push({
            group: groupName,
            match: matchIndex,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    // Update final game status
    const finalGame = await prisma.game.update({
      where: { id },
      data: {
        scores: updatedScores,
        status: hasErrors ? 'IN_PROGRESS' : 'COMPLETED'
      }
    });

    // Return appropriate response
    if (hasErrors) {
      res.status(207).json({
        game: finalGame,
        errors,
        message: 'Some matches failed to submit'
      });
    } else {
      res.status(200).json(finalGame);
    }
  } catch (error) {
    console.error('Submit Game API Error:', error);
    res.status(500).json({ message: 'Failed to submit game' });
  }
} 