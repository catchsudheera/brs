import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { capitalizeFirstLetter } from '@/utils/string';

interface MatchCombination {
  team1: string[];
  team2: string[];
}

const getMatchCombinations = (players: string[]): MatchCombination[] => {
  if (players.length === 4) {
    const [a, b, c, d] = players;
    return [
      { team1: [a, b], team2: [c, d] }, // AB-CD
      { team1: [a, c], team2: [b, d] }, // AC-BD
      { team1: [a, d], team2: [b, c] }  // AD-BC
    ];
  } else if (players.length === 5) {
    const [a, b, c, d, e] = players;
    return [
      { team1: [a, b], team2: [c, d] }, // AB-CD
      { team1: [a, c], team2: [b, e] }, // AC-BE
      { team1: [a, e], team2: [b, d] }, // AE-BD
      { team1: [a, d], team2: [c, e] }, // AD-CE
      { team1: [b, c], team2: [d, e] }  // BC-DE
    ];
  }
  return [];
};

const ScoreKeeperPage = () => {
  const router = useRouter();
  const { players } = usePlayerContext();
  const [activeGroup, setActiveGroup] = useState<string>('');
  
  // Convert URL params to groups
  const groups = Object.entries(router.query)
    .filter(([key]) => key.startsWith('group'))
    .reduce((acc, [key, value]) => {
      const groupName = `Group ${key.replace('group', '')}`;
      const playerIds = (value as string).split(',').map(Number);
      acc[groupName] = playerIds
        .map(id => players.find(p => p.id === id))
        .filter((player): player is NonNullable<typeof player> => player !== undefined)
        .sort((a, b) => a.playerRank - b.playerRank);
      return acc;
    }, {} as Record<string, typeof players>);

  // Set initial active group
  React.useEffect(() => {
    if (Object.keys(groups).length > 0 && !activeGroup) {
      setActiveGroup(Object.keys(groups)[0]);
    }
  }, [groups, activeGroup]);

  const handleBack = () => {
    router.push({
      pathname: '/admin/game-day',
      query: router.query
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Score Keeper
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Record match results for each group
        </p>
      </div>

      {/* Tab Navigation - Scrollable on mobile */}
      <div className="overflow-x-auto mb-6">
        <div className="tabs tabs-boxed inline-flex min-w-full justify-center">
          {Object.keys(groups).map((groupName) => (
            <button
              key={groupName}
              className={`tab tab-lg ${activeGroup === groupName ? 'tab-active' : ''}`}
              onClick={() => setActiveGroup(groupName)}
            >
              {groupName}
            </button>
          ))}
        </div>
      </div>

      {/* Active Group Content */}
      {activeGroup && (
        <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Players</h2>
            <div className="flex flex-wrap gap-2">
              {groups[activeGroup].map((player) => (
                <div 
                  key={player.id} 
                  className="px-3 py-1 bg-base-200 rounded-lg text-sm font-medium"
                >
                  {capitalizeFirstLetter(player.name)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Matches</h2>
            <div className="space-y-3">
              {getMatchCombinations(groups[activeGroup].map(p => p.name)).map((match, idx) => (
                <div key={idx} className="bg-base-200 rounded-lg p-3">
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-3">
                      <div className="text-center font-medium p-2 bg-base-100 rounded">
                        {match.team1.map(capitalizeFirstLetter).join(' & ')}
                      </div>
                    </div>
                    <div className="col-span-1 text-center font-bold text-sm">
                      vs
                    </div>
                    <div className="col-span-3">
                      <div className="text-center font-medium p-2 bg-base-100 rounded">
                        {match.team2.map(capitalizeFirstLetter).join(' & ')}
                      </div>
                    </div>
                  </div>
                  {/* Score input will be added here */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Button */}
      <div className="flex justify-start mt-4">
        <button 
          className="btn btn-outline"
          onClick={handleBack}
        >
          Back to Groups
        </button>
      </div>
    </div>
  );
};

export default ScoreKeeperPage; 