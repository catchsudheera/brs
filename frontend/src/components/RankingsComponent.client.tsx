import React, { useEffect, useState } from "react";
import axios from "axios";
import { Player } from "../types/player";

const RankingsComponent = () => {
  const [rankings, setRankings] = useState<Player[]>([]);

  // TODO : Get backend url from the env variable. Which already being injected to the docker env under : BACKEND_URL
  useEffect(() => {
    axios
      .get("https://brs.aragorn-media-server.duckdns.org/players")
      .then((response) => {
        const sortedData = response.data.sort(
          (a: Player, b: Player) => a.playerRank - b.playerRank
        );
        setRankings(sortedData);
      })
      .catch((error) => {
        console.error("There was an error fetching the rankings:", error);
      });
  }, []);

  const renderRankChange = (currentRank: number, previousRank: number) => {
    const change = previousRank - currentRank;
    if (change > 0) {
      return <span className="text-green-500">▲ {Math.abs(change)}</span>;
    } else if (change < 0) {
      return <span className="text-red-500">▼ {Math.abs(change)}</span>;
    } else {
      return <span className="text-gray-500">→ No change</span>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Badminton Rankings</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2">Rank Score</th>
              <th className="px-4 py-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((player) => (
              <tr key={player.id} className="border-b">
                <td className="px-4 py-2">{player.playerRank}</td>
                <td className="px-4 py-2">
                  {player.name.charAt(0).toUpperCase() + player.name.slice(1)}
                </td>
                <td className="px-4 py-2">{player.rankScore.toFixed(2)}</td>
                <td className="px-4 py-2">
                  {renderRankChange(player.playerRank, player.previousRank)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingsComponent;
