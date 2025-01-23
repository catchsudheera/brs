import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { capitalizeFirstLetter } from '@/utils/string';

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 20;
const MAX_GROUPS = 4;
const MIN_GROUP_SIZE = 4;
const MAX_GROUP_SIZE = 5;

// Helper function to check if player count can be evenly divided into valid groups
const isValidPlayerCount = (count: number) => {
  if (count < MIN_PLAYERS || count > MAX_PLAYERS) return false;
  
  // Check if we can divide players into groups of 4 or 5
  for (let numGroups = 1; numGroups <= MAX_GROUPS; numGroups++) {
    const minPlayersNeeded = numGroups * MIN_GROUP_SIZE;
    const maxPlayersNeeded = numGroups * MAX_GROUP_SIZE;
    if (count >= minPlayersNeeded && count <= maxPlayersNeeded) {
      return true;
    }
  }
  return false;
};

interface GroupedPlayers {
  [key: string]: Player[];
}

const GamePlannerPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { players } = usePlayerContext();
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

  // Only redirect if auth is enabled
  React.useEffect(() => {
    if (AUTH_ENABLED && status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (AUTH_ENABLED && status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(current => {
      if (current.includes(playerId)) {
        return current.filter(id => id !== playerId);
      }
      if (current.length >= 20) {
        return current;
      }
      return [...current, playerId];
    });
  };

  const getValidationMessage = (count: number) => {
    if (count < MIN_PLAYERS) return 'Select at least 4 players';
    if (count > MAX_PLAYERS) return 'Maximum 20 players allowed';
    if (!isValidPlayerCount(count)) return 'Player count must allow for groups of 4-5 players';
    return '';
  };

  const handleCreateGameDay = () => {
    // Get selected players with their details
    const selectedPlayerDetails = players
      .filter(p => selectedPlayers.includes(p.id))
      .sort((a, b) => a.playerRank - b.playerRank);

    const totalPlayers = selectedPlayerDetails.length;
    
    // Calculate how many groups we need and how to distribute players
    let remainingPlayers = totalPlayers;
    const groups: GroupedPlayers = {};
    let currentGroup = 1;

    while (remainingPlayers > 0) {
      // If remaining players can't fill a minimum group, add them to the last group
      if (remainingPlayers < MIN_GROUP_SIZE) {
        groups[`Group ${currentGroup - 1}`].push(...selectedPlayerDetails.slice(totalPlayers - remainingPlayers));
        break;
      }

      // Determine group size
      let groupSize = MIN_GROUP_SIZE;
      const playersAfterMinGroup = remainingPlayers - MIN_GROUP_SIZE;
      const remainingGroups = Math.ceil(playersAfterMinGroup / MIN_GROUP_SIZE);

      // If we have extra players, add them to the last groups
      if (playersAfterMinGroup > 0 && remainingGroups === 0) {
        groupSize = remainingPlayers;
      } else if (playersAfterMinGroup > 0 && 
                 playersAfterMinGroup < remainingGroups * MIN_GROUP_SIZE) {
        // We need to distribute extra players to last groups
        const totalExtraPlayers = playersAfterMinGroup % MIN_GROUP_SIZE;
        const groupsNeedingExtra = Math.ceil(totalExtraPlayers / (MAX_GROUP_SIZE - MIN_GROUP_SIZE));
        const isLastGroups = currentGroup > MAX_GROUPS - groupsNeedingExtra;
        
        if (isLastGroups) {
          groupSize = MAX_GROUP_SIZE;
        }
      }

      // Create group and add players
      const startIdx = totalPlayers - remainingPlayers;
      groups[`Group ${currentGroup}`] = selectedPlayerDetails.slice(startIdx, startIdx + groupSize);
      
      remainingPlayers -= groupSize;
      currentGroup++;
    }

    // Convert groups to URL query params
    const queryParams = Object.entries(groups)
      .reduce((params, [groupName, players]) => {
        const groupNum = groupName.split(' ')[1];  // Get number from "Group X"
        params[`group${groupNum}`] = players.map(p => p.id).join(',');
        return params;
      }, {} as Record<string, string>);

    // Navigate with cleaner query params
    router.push({
      pathname: '/admin/game-day',
      query: queryParams
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Title Section */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Game Planner
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Select players for the game day (maximum 20)
        </p>
      </div>

      {/* Player Selection */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Selected Players: {selectedPlayers.length}/{MAX_PLAYERS}
          </h2>
          <button
            className={`btn ${
              !isValidPlayerCount(selectedPlayers.length)
                ? 'btn-disabled bg-gray-300 cursor-not-allowed' 
                : 'btn-primary'
            }`}
            disabled={!isValidPlayerCount(selectedPlayers.length)}
            title={getValidationMessage(selectedPlayers.length)}
            onClick={handleCreateGameDay}
          >
            Create Game Day
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select players for groups of 4-5 players (maximum {MAX_GROUPS} groups)
          </p>
          {selectedPlayers.length > 0 && !isValidPlayerCount(selectedPlayers.length) && (
            <p className="text-sm text-red-500 mt-2">
              {getValidationMessage(selectedPlayers.length)}
            </p>
          )}
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players
            .sort((a, b) => a.playerRank - b.playerRank)
            .map(player => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border transition-colors duration-150 cursor-pointer ${
                  selectedPlayers.includes(player.id)
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 hover:border-emerald-500'
                }`}
                onClick={() => handlePlayerToggle(player.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {capitalizeFirstLetter(player.name)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Rank: #{player.playerRank}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlayers.includes(player.id)
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedPlayers.includes(player.id) && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GamePlannerPage; 