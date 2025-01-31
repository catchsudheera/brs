import useSWR from 'swr';
import type { EnhancedEncountersResponse } from '@/types/encounters';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePlayerEncounters(playerId: string | string[] | undefined) {
  const { data, error, isLoading } = useSWR<EnhancedEncountersResponse>(
    playerId ? `/api/players/${playerId}/encounters` : null,
    fetcher
  );

  return {
    encounters: data,
    isLoading,
    error
  };
} 