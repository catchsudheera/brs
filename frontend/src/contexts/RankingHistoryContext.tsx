import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import {
  PlayerHistory,
  GraphData,
  PlayerHistoryEntry,
} from '@/types/playerHistoryTypes';
import { parseISO, subDays, format } from 'date-fns';
import { capitalizeFirstLetter } from '@/utils/string';

const RankingHistoryContext = createContext<{
  data: GraphData[];
  loading: boolean;
  error: Error | null;
}>({
  data: [],
  loading: false,
  error: null,
});

export const useRankingHistoryContext = () => useContext(RankingHistoryContext);

export const RankingHistoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<PlayerHistory[]>(
          'https://brs.aragorn-media-server.duckdns.org/players/history?type=RANK',
        );

        const preprocessedData = preprocessDataToAddOldEntries(response.data);
        const transformedData = transformDataForGraph(preprocessedData);
        setData(transformedData);
      } catch (error) {
        console.error('There was an error fetching the history data:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  const preprocessDataToAddOldEntries = (
    players: PlayerHistory[],
  ): PlayerHistory[] => {
    return players.map((player) => {
      if (player.history.length > 0) {
        const sortedHistory = player.history.sort(
          (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
        );
        const mostRecentEntry = sortedHistory[0];

        const newDate = subDays(parseISO(mostRecentEntry.date), 7);

        const newEntry: PlayerHistoryEntry = {
          oldRank: mostRecentEntry.oldRank,
          newRank: mostRecentEntry.oldRank,
          date: format(newDate, 'yyyy-MM-dd'),
        };

        return {
          ...player,
          history: [...player.history, newEntry],
        };
      }
      return player;
    });
  };

  const transformDataForGraph = (players: PlayerHistory[]): GraphData[] => {
    let graphData: GraphData[] = [];
    players.forEach((player) => {
      player.history.forEach((entry) => {
        let existingDateEntry = graphData.find((e) => e.date === entry.date);
        const playerNameCapitalized = capitalizeFirstLetter(player.playerName);
        if (existingDateEntry) {
          existingDateEntry[playerNameCapitalized] = entry.newRank;
        } else {
          const newEntry: GraphData = {
            date: entry.date,
            [playerNameCapitalized]: entry.newRank,
          };
          graphData.push(newEntry);
        }
      });
    });

    graphData.sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    );
    return graphData;
  };

  return (
    <RankingHistoryContext.Provider value={{ data, loading, error }}>
      {children}
    </RankingHistoryContext.Provider>
  );
};
