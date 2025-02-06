import useSWR from 'swr';
import type { GameWithMatches } from '@/types/game';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useMyMatches() {
  const { data, error, isLoading, mutate } = useSWR<GameWithMatches[]>(
    '/api/games/my-matches',
    fetcher
  );

  return {
    games: data || [],
    isLoading,
    error,
    mutate
  };
} 