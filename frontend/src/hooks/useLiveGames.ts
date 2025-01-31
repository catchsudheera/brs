import useSWR from 'swr';

export interface LiveGame {
  id: string;
  progress: number;
  createdAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch live games');
  return res.json();
};

export function useLiveGames(refreshInterval = 30000) {
  const { data, error, isLoading } = useSWR<LiveGame[]>(
    '/api/games/in-progress',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  return {
    liveGames: data || [],
    isLoading,
    isError: error
  };
} 