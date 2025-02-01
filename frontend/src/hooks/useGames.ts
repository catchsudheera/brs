import useSWR from 'swr';
import type { Game } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useGames() {
  const { data, error, isLoading, mutate } = useSWR<Game[]>(
    '/api/games',
    fetcher
  );

  return {
    games: data || [],
    isLoading,
    error,
    mutate
  };
} 