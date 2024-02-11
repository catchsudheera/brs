import React from 'react';
import { Encounter, EncounterPlayer } from '@/types/encounter';
import { capitalizeFirstLetter } from '@/utils/string';

interface PlayerEncounterComponentProps {
  encounter: Encounter;
}

const renderTeamList = (team: EncounterPlayer[]) =>
  team
    .map(
      (player, index) =>
        `${capitalizeFirstLetter(player.playerName)}${
          index < team.length - 1 ? ', ' : ''
        }`,
    )
    .join('');

const PlayerEncounterComponent: React.FC<PlayerEncounterComponentProps> = ({
  encounter,
}) => {
  const scoreColorClass =
    encounter.encounterScore < 0 ? 'text-red-500' : 'text-green-500';

  const determineRowBackground = (
    playerPoints: number,
    opponentPoints: number,
  ) => {
    return playerPoints > opponentPoints ? 'bg-green-100' : 'bg-red-100';
  };

  return (
    <div className='mb-8'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center'>
        <div className={`font-bold text-lg lg:text-xl ${scoreColorClass}`}>
          Score: {encounter.encounterScore > 0 ? '+' : '-'}
          {Math.abs(encounter.encounterScore)}
        </div>
      </div>
      <table className='table-auto w-full'>
        <thead>
          <tr>
            <th className='border px-4 py-2'>Players</th>
            <th className='border px-4 py-2'>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr
            className={determineRowBackground(
              encounter.playerTeamPoints,
              encounter.opponentTeamPoints,
            )}
          >
            <td className='border px-4 py-2'>
              {renderTeamList(encounter.playerTeam)}
            </td>
            <td className='border px-4 py-2 text-center'>
              {encounter.playerTeamPoints}
            </td>
          </tr>
          <tr className='bg-gray-100'>
            <td className='border px-4 py-2 text-center' colSpan={2}>
              vs
            </td>
          </tr>
          <tr
            className={determineRowBackground(
              encounter.opponentTeamPoints,
              encounter.playerTeamPoints,
            )}
          >
            <td className='border px-4 py-2'>
              {renderTeamList(encounter.opponentTeam)}
            </td>
            <td className='border px-4 py-2 text-center'>
              {encounter.opponentTeamPoints}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PlayerEncounterComponent;
