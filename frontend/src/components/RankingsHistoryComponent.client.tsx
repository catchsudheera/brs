import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PlayerHistory,
  GraphData,
  PlayerHistoryEntry,
} from "../types/playerHistoryTypes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { parseISO, subDays, formatISO, format } from "date-fns";
import { Player } from "../types/player";

const RankingsHistoryComponent = () => {
  const [data, setData] = useState<GraphData[]>([]);
  const [playerColors, setPlayerColors] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const response = await axios.get<PlayerHistory[]>(
          "https://brs.aragorn-media-server.duckdns.org/players/history?type=RANK"
        );
        const preprocessedData = preprocessDataToAddOldEntries(response.data);
        const transformedData = transformDataForGraph(preprocessedData);
        setData(transformedData);
      } catch (error) {
        console.error("There was an error fetching the history data:", error);
      }
    };

    fetchHistoryData();
  }, []);

  useEffect(() => {
    const fetchPlayerColorsForGraph = async () => {
      try {
        const response = await axios.get<Player[]>(
          "https://brs.aragorn-media-server.duckdns.org/players"
        );
        const players = response.data;
        const colorsMapping: { [key: string]: string } = {};

        players.forEach((player) => {
          colorsMapping[capitalizeFirstLetter(player.name)] = player.colorHex;
        });

        setPlayerColors(colorsMapping);
      } catch (error) {
        console.error("There was an error fetching the players data:", error);
      }
    };

    fetchPlayerColorsForGraph();
  }, []);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const preprocessDataToAddOldEntries = (
    players: PlayerHistory[]
  ): PlayerHistory[] => {
    return players.map((player) => {
      if (player.history.length > 0) {
        const sortedHistory = player.history.sort(
          (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
        );
        const mostRecentEntry = sortedHistory[0];

        const newDate = subDays(parseISO(mostRecentEntry.date), 7);

        const newEntry: PlayerHistoryEntry = {
          oldRank: mostRecentEntry.oldRank,
          newRank: mostRecentEntry.oldRank,
          date: format(newDate, "yyyy-MM-dd"),
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
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    return graphData;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis reversed={true} domain={["dataMin", "dataMax"]} />
        <Tooltip />
        <Legend />
        {data.length > 0 &&
          Object.keys(data[0])
            .filter((key) => key !== "date")
            .map((key, idx) => {
              return (
                <Line
                  type="monotone"
                  dataKey={key}
                  stroke={
                    playerColors[key]
                      ? `#${playerColors[key]}`
                      : `#${Math.floor(Math.random() * 16777215).toString(16)}`
                  }
                  key={idx}
                />
              );
            })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RankingsHistoryComponent;
