import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { capitalizeFirstLetter } from '@/utils/string';
import { gameStorageService } from '@/services/gameStorageService';
import type { Player } from '@/types/player';

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
  const [isEditing, setIsEditing] = useState(false);
  const { gameId } = router.query;

  // Load existing game data if editing
  React.useEffect(() => {
    const loadExistingGame = async () => {
      if (typeof gameId === 'string') {
        try {
          const game = await gameStorageService.getGame(gameId);
          if (game) {
            setIsEditing(true);
            // Combine all player IDs from all groups
            const selectedIds = Object.values(game.groups)
              .flat()
              .filter((id, index, self) => self.indexOf(id) === index);
            setSelectedPlayers(selectedIds);
          }
        } catch (error) {
          console.error('Failed to load game:', error);
        }
      }
    };

    loadExistingGame();
  }, [gameId]);

  // Only redirect if auth is enabled
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
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

  const handleCreateGameDay = async () => {
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
        const groupNum = groupName.split(' ')[1];
        params[`group${groupNum}`] = players.map(p => p.id).join(',');
        return params;
      }, {} as Record<string, string>);

    try {
      let gameIdToUse = gameId;  // Create mutable variable
      
      if (isEditing && typeof gameId === 'string') {
        await gameStorageService.updateGame(gameId, Object.entries(groups).reduce((acc, [groupName, players]) => {
          acc[groupName] = players.map(p => p.id);
          return acc;
        }, {} as Record<string, number[]>));
      } else {
        gameIdToUse = await gameStorageService.createGame(
          Object.entries(groups).reduce((acc, [groupName, players]) => {
            acc[groupName] = players.map(p => p.id);
            return acc;
          }, {} as Record<string, number[]>)
        );
      }

      router.push({
        pathname: '/admin/game-day',
        query: { gameId: gameIdToUse }
      });
    } catch (error) {
      console.error('Failed to save game:', error);
      // TODO: Show error toast/notification
    }
  };

  return (
    <div className="container mx-auto p-4 pb-32 md:pb-4">
      {/* Title Section */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          {isEditing ? 'Edit Game Day' : 'Game Planner'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {isEditing 
            ? 'Modify player selection for the game day'
            : 'Select players for the game day (maximum 20)'}
        </p>
      </div>

      {/* Player Grid */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
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

      {/* Fixed Bottom Panel on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 shadow-lg p-4 md:hidden border-t border-base-200">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              Selected: {selectedPlayers.length}/{MAX_PLAYERS}
            </div>
            {selectedPlayers.length > 0 && !isValidPlayerCount(selectedPlayers.length) && (
              <div className="text-sm text-red-500">
                {getValidationMessage(selectedPlayers.length)}
              </div>
            )}
          </div>
          <button
            className={`btn w-full ${
              !isValidPlayerCount(selectedPlayers.length)
                ? 'btn-disabled bg-gray-300 cursor-not-allowed' 
                : 'btn-primary'
            }`}
            disabled={!isValidPlayerCount(selectedPlayers.length)}
            title={getValidationMessage(selectedPlayers.length)}
            onClick={handleCreateGameDay}
          >
            {isEditing ? 'Update Game Day' : 'Create Game Day'}
          </button>
        </div>
      </div>

      {/* Desktop Actions - Hide on Mobile */}
      <div className="hidden md:block mt-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Selected Players: {selectedPlayers.length}/{MAX_PLAYERS}
          </div>
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
            {isEditing ? 'Update Game Day' : 'Create Game Day'}
          </button>
        </div>
        {selectedPlayers.length > 0 && !isValidPlayerCount(selectedPlayers.length) && (
          <p className="text-sm text-red-500 mt-2">
            {getValidationMessage(selectedPlayers.length)}
          </p>
        )}
      </div>
    </div>
  );
};

export default GamePlannerPage; 