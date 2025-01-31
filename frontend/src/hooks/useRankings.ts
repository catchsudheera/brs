import useSWR from 'swr';
import type { RankingsResponse } from '@/types/rankings';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useRankings() {
  const { data, error, isLoading } = useSWR<RankingsResponse>(
    '/api/rankings',
    fetcher
  );

  return {
    rankings: data,
    isLoading,
    error
  };
} 