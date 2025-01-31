import React from 'react';
import Link from 'next/link';
import { useRankings } from '@/hooks/useRankings';

const RankingsComponent = () => {
  const { rankings, error, isLoading } = useRankings();

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error">
      <span>Error fetching rankings: {error.message}</span>
    </div>
  );

  if (!rankings) return null;

  const { stats, players } = rankings;

  const renderRankChange = (change: { direction: string; amount: number }) => {
    if (change.direction === 'up') {
      return <span className='text-green-500'>▲ {change.amount}</span>;
    } else if (change.direction === 'down') {
      return <span className='text-red-500'>▼ {change.amount}</span>;
    }
    return <span className='text-gray-500'> </span>;
  };

  return (
    <div className='container mx-auto p-4'>
      {/* Title Section */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Player Rankings
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Current standings of all active players
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="stat bg-base-200 rounded-lg shadow-md p-2 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Players</div>
          <div className="stat-value text-lg sm:text-3xl">{stats.totalPlayers}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow-md p-2 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Top Score</div>
          <div className="stat-value text-lg sm:text-3xl">{stats.topScore.toFixed(1)}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow-md p-2 sm:p-4">
          <div className="stat-title text-xs sm:text-sm">Average</div>
          <div className="stat-value text-lg sm:text-3xl">{stats.averageScore.toFixed(1)}</div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className='overflow-x-auto bg-base-100 rounded-lg shadow-lg'>
        <table className='table w-full'>
          <thead>
            <tr className="bg-base-200">
              <th className='px-4 py-3 text-center' colSpan={2}>Rank</th>
              <th className='px-4 py-3'>Player</th>
              <th className='px-4 py-3 text-center'>Score</th>
              <th className='px-4 py-3 text-center'>Highest Rank</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr 
                key={player.id} 
                className={`hover:bg-base-200 transition-colors duration-150 ${
                  player.isAboveAverage 
                    ? 'bg-blue-50 dark:bg-blue-900/10' 
                    : 'bg-amber-50 dark:bg-amber-900/10'
                }`}
              >
                <td className='px-1 py-3 items-center text-center font-medium'>
                  {player.playerRank}
                </td>
                <td className='px-1 py-3 items-center text-center text-xs'>
                  {renderRankChange(player.rankChange)}
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
                  <span className="font-medium">{player.highestRank}</span>
                  <span className='text-xs text-gray-400 ml-1'>
                    ({player.timeInHighestRank})
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
