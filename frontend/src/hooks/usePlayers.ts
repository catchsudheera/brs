import useSWR from 'swr';
import type { Player } from '@/types/player';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePlayers() {
  const { data, error, isLoading, mutate } = useSWR<Player[]>(
    '/api/players',
    fetcher
  );

  return {
    players: data || [],
    isLoading,
    error,
    mutate
  };
}