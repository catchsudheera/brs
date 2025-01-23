import React from 'react';
import { useRouter } from 'next/router';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { capitalizeFirstLetter } from '@/utils/string';

const GameDayPage = () => {
  const router = useRouter();
  const { players } = usePlayerContext();
  
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

  const handleContinue = () => {
    router.push({
      pathname: '/admin/score-keeper',
      query: router.query // Pass along the same group parameters
    });
  };

  const handleBack = () => {
    router.push('/admin/game-planner');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Game Day Groups
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Players and their groups for the game day
        </p>
      </div>

      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
          {Object.entries(groups).map(([groupName, players]) => (
            <div key={groupName} className="p-4">
              <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-base-200">
                {groupName}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({players.length} players)
                </span>
              </h2>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between py-1 ${
                      index !== players.length - 1 ? 'border-b border-base-200/50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {capitalizeFirstLetter(player.name)}
                      </span>
                      <span className="text-xs text-gray-500">
                        (#{player.playerRank})
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      {player.rankScore.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          className="btn btn-outline"
          onClick={handleBack}
        >
          Back to Selection
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleContinue}
        >
          Continue to Score Keeper
        </button>
      </div>
    </div>
  );
};

export default GameDayPage; 