import useSWR from 'swr';
import type { Game } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useGame(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Game>(
    id ? `/api/games/${id}` : null,
    fetcher
  );

  return {
    game: data,
    isLoading,
    error,
    mutate
  };
} 