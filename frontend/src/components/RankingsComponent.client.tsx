import React from 'react';
import Link from 'next/link';
import { usePlayerContext } from '@/contexts/PlayerContext';

const RankingsComponent = () => {
  const { players, loading, error } = usePlayerContext();

  const renderRankChange = (currentRank: number, previousRank: number) => {
    const change = previousRank - currentRank;
    if (change > 0) {
      return <span className='text-green-500'>▲ {Math.abs(change)}</span>;
    } else if (change < 0) {
      return <span className='text-red-500'>▼ {Math.abs(change)}</span>;
    } else {
      return <span className='text-gray-500'> </span>;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error">
      <span>Error fetching rankings: {error.message}</span>
    </div>
  );

  const sortedPlayers = [...players].sort(
    (a, b) => a.playerRank - b.playerRank,
  );

  const formatDays = (days: string) => {
    return days.replace('(', '').replace(')', '');
  };

  return (
    <div className='container mx-auto p-4'>
      {/* Title Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Player Rankings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Current standings of all active players
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-lg shadow-md">
          <div className="stat-title">Total Players</div>
          <div className="stat-value">{players.length}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow-md">
          <div className="stat-title">Top Score</div>
          <div className="stat-value">
            {Math.max(...players.map(p => p.rankScore)).toFixed(2)}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow-md">
          <div className="stat-title">Average Score</div>
          <div className="stat-value">
            {(players.reduce((acc, p) => acc + p.rankScore, 0) / players.length).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className='overflow-x-auto bg-base-100 rounded-lg shadow-lg'>
        <table className='table w-full'>
          <thead>
            <tr className="bg-base-200">
              <th className='px-4 py-3 text-center' colSpan={2}>
                Rank
              </th>
              <th className='px-4 py-3'>Player</th>
              <th className='px-4 py-3 text-center'>Score</th>
              <th className='px-4 py-3 text-center'>Highest Rank</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr key={player.id} className='hover:bg-base-200 transition-colors duration-150'>
                <td className='px-1 py-3 items-center text-center font-medium'>
                  {player.playerRank}
                </td>
                <td className='px-1 py-3 items-center text-center text-xs'>
                  {renderRankChange(player.playerRank, player.previousRank)}
                </td>
                <td className='px-4 py-3'>
                  <Link
                    href={`/player/${player.id}/encounters`}
                    className='hover:text-emerald-500 transition-colors duration-150'
                  >
                    {player.name}
                  </Link>
                </td>
                <td className='px-4 py-3 items-center text-center'>
                  {player.rankScore.toFixed(2)}
                </td>
                <td className='px-4 py-3 items-center text-center'>
                  <span className="font-medium">{`${player.highestRank}`}</span>
                  <span className='text-xs text-gray-400 ml-1'>
                    ({formatDays(player.timeInHighestRank)})
                  </span>
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
