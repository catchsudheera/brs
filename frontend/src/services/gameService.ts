import type { Game } from '@prisma/client';

export interface GameInput {
  groups: Record<string, number[]>;
  scores?: Record<string, number>;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
}

export const gameService = {
  createGame: async (data: GameInput): Promise<Game> => {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create game');
    return response.json();
  },

  getGame: async (id: string): Promise<Game> => {
    const response = await fetch(`/api/games/${id}`);
    if (!response.ok) throw new Error('Failed to fetch game');
    return response.json();
  },

  updateGame: async (id: string, data: Partial<GameInput>): Promise<Game> => {
    const response = await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update game');
    return response.json();
  },

  deleteGame: async (id: string): Promise<void> => {
    const response = await fetch(`/api/games/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete game');
  },
}; 