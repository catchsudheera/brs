import useSWR from 'swr';
import type { RankingHistoryData } from '@/types/rankings';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useRankingHistory() {
  const { data, error, isLoading } = useSWR<RankingHistoryData[]>(
    '/api/rankings/history',
    fetcher
  );

  return {
    rankingHistory: data || [],
    isLoading,
    error
  };
} 