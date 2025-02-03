import useSWR from 'swr';
import type { Player } from '@/types/player';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useInactivePlayers() {
  const { data, error, isLoading, mutate } = useSWR<Player[]>(
    '/api/players/inactive',
    fetcher
  );

  return {
    inactivePlayers: data || [],
    isLoading,
    error,
    mutate
  };
} 