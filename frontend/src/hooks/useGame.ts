import useSWR from 'swr';
import type { Game } from '@/types/game';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useGame(gameId: string) {
  const { data: game, error, mutate, isLoading } = useSWR<Game>(
    gameId ? `/api/games/${gameId}` : null,
    fetcher
  );

  return {
    game,
    isLoading,
    isError: error,
    mutate
  };
} 