import useSWR from 'swr';
import type { Encounter } from '@/types/encounter';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useEncounterHistory(teamA1: number, teamA2: number, teamB1: number, teamB2: number) {
  const { data, error, isLoading, mutate } = useSWR<Encounter[]>(
    'encounters', // Use a key for the cache
    null, // No automatic fetching
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const fetchEncounters = async () => {
    if (!teamA1) return;
    const url = `/api/encounters/history?teamA1=${teamA1}&teamA2=${teamA2}&teamB1=${teamB1}&teamB2=${teamB2}`;
    return mutate(fetcher(url), { revalidate: false });
  };

  return {
    encounters: data || [],
    isLoading,
    error,
    fetchEncounters
  };
} 