import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlayerHistory, GraphData } from "../types/playerHistoryTypes";
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

const RankingsHistoryComponent = () => {
  const [data, setData] = useState<GraphData[]>([]);

  useEffect(() => {
    axios
      .get<PlayerHistory[]>(
        "https://brs.aragorn-media-server.duckdns.org/players/history?type=RANK"
      )
      .then((response) => {
        const transformedData = transformDataForGraph(response.data);
        setData(transformedData);
      })
      .catch((error) => {
        console.error("There was an error fetching the history data:", error);
      });
  }, []);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
            .map((key, idx) => (
              <Line
                type="monotone"
                dataKey={key}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                key={idx}
              />
            ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RankingsHistoryComponent;
