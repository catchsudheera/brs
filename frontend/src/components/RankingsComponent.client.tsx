import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Player } from '../types/player';

const RankingsComponent = () => {
    const [rankings, setRankings] = useState<Player[]>([]);

    useEffect(() => {
      axios.get('https://brs.aragorn-media-server.duckdns.org/players')
        .then(response => {
          setRankings(response.data);
        })
        .catch(error => {
          console.error("There was an error fetching the rankings:", error);
        });
    }, []);
  
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
              </tr>
            </thead>
            <tbody>
              {rankings.map((player) => (
                <tr key={player.id} className="border-b">
                  <td className="px-4 py-2">{player.playerRank}</td>
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">{player.rankScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
};

export default RankingsComponent;