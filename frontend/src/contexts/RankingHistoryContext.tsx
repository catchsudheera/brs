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
  RankingHistoryContextType,
} from '@/types/playerHistoryTypes';
import { parseISO, subDays, format } from 'date-fns';
import { capitalizeFirstLetter } from '@/utils/string';

const RankingHistoryContext = createContext<RankingHistoryContextType>({
  rankingHistoryData: [],
  rankingHistoryloading: false,
  rankingHistoryError: null,
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

        const transformedData = transformDataForGraph(response.data);
        const postProcessedData = postProcessDataToAddPreviousDates(transformedData, response.data);
        setData(postProcessedData);
      } catch (error) {
        console.error('There was an error fetching the history data:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  const postProcessDataToAddPreviousDates = (ranksPerDateArr: GraphData[], historyPerPlayerArr: PlayerHistory[]): GraphData[] => {
    // Defining a virtual starting date 7 days before the available first date
    let startingDate = subDays(parseISO(ranksPerDateArr[0].date), 7);

    // Iterating through the data set to prefill ranks where missing.
    //  1. Virtual staring date gets the oldRank of the player on the first date.
    //  2. Players started in the middle get the old rank assigned from the virtual staring date until the encounter date before they first joined.

    const playerToInitialOldRankMap = historyPerPlayerArr.map((playerHistory) => {
      const sortedHistory = playerHistory.history.sort(
        (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
      );

      return {player: capitalizeFirstLetter(playerHistory.playerName), initialOldRank: sortedHistory[0].oldRank};
    });

    ranksPerDateArr.unshift({date: format(startingDate, 'yyyy-MM-dd')});
    ranksPerDateArr.forEach((e) => {
      for (let item of playerToInitialOldRankMap) {
         if(!(item.player in e)) {
            e[item.player] = item.initialOldRank;
         }
      }
    });

    return ranksPerDateArr;
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
    <RankingHistoryContext.Provider
      value={{
        rankingHistoryData: data,
        rankingHistoryloading: loading,
        rankingHistoryError: error,
      }}
    >
      {children}
    </RankingHistoryContext.Provider>
  );
};
