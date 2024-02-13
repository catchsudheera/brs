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

  if (loading) return <div>Loading rankings...</div>;
  if (error) return <div>Error fetching rankings: {error.message}</div>;

  const sortedPlayers = [...players].sort(
    (a, b) => a.playerRank - b.playerRank,
  );

  const formatDays = (days: string) => {
    return days.replace('(', '').replace(')', '');
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='overflow-x-auto'>
        <table className='table-auto w-full'>
          <thead className='bg-gray-200'>
            <tr>
              <th className='px-4 py-2' colSpan={2}>
                Rank
              </th>
              <th className='px-4 py-2'>Player</th>
              <th className='px-4 py-2'>Score</th>
              <th className='px-4 py-2'>Highest Rank</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr key={player.id} className='border-b'>
                <td className='px-1 py-2 items-center text-center'>
                  {player.playerRank}
                </td>
                <td className='px-1 py-2 items-center text-center text-xs'>
                  {renderRankChange(player.playerRank, player.previousRank)}
                </td>
                <td className='px-4 py-2'>
                  <Link
                    href={`/player/${player.id}/encounters`}
                    className='text-blue-600 hover:text-blue-800'
                  >
                    {player.name}
                  </Link>
                </td>
                <td className='px-4 py-2 items-center text-center'>
                  {player.rankScore.toFixed(2)}
                </td>
                <td className='px-4 py-2 items-center text-center'>
                  <span>{`${player.highestRank}`} </span>
                  <span className='text-xs text-gray-400'>({formatDays(player.timeInHighestRank)})</span>
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
