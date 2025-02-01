import useSWR from 'swr';
import type { Game } from '@/types/game';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useGames() {
  const { data: games, error, isLoading } = useSWR<Game[]>(
    '/api/games',
    fetcher
  );

  return {
    games,
    isLoading,
    isError: error
  };
} 