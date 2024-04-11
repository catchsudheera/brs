import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EncountersResponse, Encounter } from '@/types/encounter';
import { capitalizeFirstLetter, groupBy, sumBy } from '@/utils/string';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { Player } from '@/types/player';
import PlayerEncounterComponent from './PlayerEncounterComponent';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

interface PlayerEncountersComponentProps {
  playerId: string | string[] | undefined;
}

const PlayerEncountersCompactComponent: React.FC<
  PlayerEncountersComponentProps
> = ({ playerId }) => {
  const { players } = usePlayerContext();
  const [encountersByDate, setEncountersByDate] = useState<
    Record<string, Encounter[]>
  >({});
  const [scoreSumByDate, setScoreSumByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (players.length > 0) {
      const player = players.find((player) => player.id === Number(playerId));
      setPlayer(player || null);
    }
  }, [players, playerId]);

  useEffect(() => {
    const fetchEncounters = async () => {
      if (!playerId) return;
      setLoading(true);
      try {
        const response = await axios.get<EncountersResponse>(
          `https://brs.aragorn-media-server.duckdns.org/players/${playerId}/encounters`,
        );
        const groupedByDate = groupBy(
          response.data.encounterHistory,
          (encounter) => encounter.encounterDate,
        );
        setEncountersByDate(groupedByDate);
        
        const sumByDate = sumBy(
          response.data.encounterHistory,
          (encounter) => encounter.encounterDate,
        );

        setScoreSumByDate(sumByDate);
      } catch (error) {
        console.error(
          'There was an error fetching the encounters data:',
          error,
        );
        setError('Failed to fetch encounters data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEncounters();
  }, [playerId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderTableRow = (encounter: Encounter) => {
    return (
      <tr
        key={encounter.encounterId}
        className={
          encounter.playerTeamPoints > encounter.opponentTeamPoints
            ? 'bg-green-100'
            : 'bg-red-100'
        }
      >
        <td>
          {encounter.playerTeam
            .map((player) => capitalizeFirstLetter(player.playerName))
            .join(', ')}
        </td>
        <td>{encounter.playerTeamPoints}</td>
        <td>
          {encounter.opponentTeam
            .map((player) => capitalizeFirstLetter(player.playerName))
            .join(', ')}
        </td>
        <td>{encounter.opponentTeamPoints}</td>
        <td>
          {encounter.playerTeamPoints > encounter.opponentTeamPoints
            ? 'Won'
            : 'Lost'}
        </td>
        <td
          className={`font-bold ${encounter.encounterScore > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {encounter.encounterScore > 0 ? '+' : '-'}
          {Math.abs(encounter.encounterScore)}
        </td>
      </tr>
    );
  };

  const renderSum=(sum: number) => {
    const formattedSum = (Math.round(sum * 100) / 100).toFixed(2);
    return (
      <span className={`font-bold ${Math.sign(sum) == 1 ? 'text-green-600' : 'text-red-600'}`}>
        Net Score : 
        {Math.sign(sum) == 1 ? '+' : ''}
        {formattedSum}
        </span>
    );
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold text-center my-4'>
        Encounters for {player ? capitalizeFirstLetter(player.name) : ''}
      </h1>
      {Object.entries(encountersByDate).map(([date, encounters], idx) => (
        <Disclosure
          key={date}
          as='div'
          className='mb-4'
          defaultOpen={idx === 0}
        >
          {({ open }) => (
            <>
              <Disclosure.Button className='flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-200 bg-opacity-50 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75'>
                <span className='text-gray-700'>{date}</span>
                {open ? renderSum(scoreSumByDate[date]) : null}
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-gray-700`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pt-4 pb-2 text-sm text-gray-500'>
                <div className='overflow-x-auto'>
                  {/* Desktop Table View */}
                  <table className='table w-full hidden md:table'>
                    <thead>
                      <tr>
                        <th>Team 1</th>
                        <th>Points</th>
                        <th>Team 2</th>
                        <th>Points</th>
                        <th>Result</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {encounters.map((encounter) => renderTableRow(encounter))}
                    </tbody>
                  </table>
                  {/* Mobile View */}
                  <div className='md:hidden'>
                    {encounters.map((encounter) => (
                      <PlayerEncounterComponent
                        key={encounter.encounterId}
                        encounter={encounter}
                      />
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default PlayerEncountersCompactComponent;
