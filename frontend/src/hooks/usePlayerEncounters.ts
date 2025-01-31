import useSWR from 'swr';
import type { Encounter } from '@/types/encounter';

interface EncountersResponse {
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  encountersByDate: Record<string, Encounter[]>;
  scoreSumByDate: Record<string, number>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePlayerEncounters(playerId: string | string[] | undefined) {
  const { data, error, isLoading } = useSWR<EncountersResponse>(
    playerId ? `/api/players/${playerId}/encounters` : null,
    fetcher
  );

  return {
    encounters: data,
    isLoading,
    error
  };
} 