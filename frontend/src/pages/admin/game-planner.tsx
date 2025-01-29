import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { gameStorageService } from '@/services/gameStorageService';
import { PlayerCard } from '@/components/game-planner/PlayerCard';
import { ActionPanel } from '@/components/game-planner/ActionPanel';
import { isValidPlayerCount } from '@/utils/game-validation';

const MAX_PLAYERS = 20;

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
      if (current.length >= MAX_PLAYERS) {
        return current;
      }
      return [...current, playerId];
    });
  };

  const getValidationMessage = (count: number) => {
    if (count < 4) return 'Select at least 4 players';
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
    
    // Calculate number of groups and distribution
    const distribution = calculateGroupDistribution(totalPlayers);
    const groups: Record<string, number[]> = {};
    
    let playerIndex = 0;
    distribution.forEach((groupSize, index) => {
      groups[`Group ${index + 1}`] = selectedPlayerDetails
        .slice(playerIndex, playerIndex + groupSize)
        .map(p => p.id);
      playerIndex += groupSize;
    });

    // Convert groups to URL query params
    const queryParams = Object.entries(groups)
      .reduce((params, [groupName, players]) => {
        const groupNum = groupName.split(' ')[1];
        params[`group${groupNum}`] = players.join(',');
        return params;
      }, {} as Record<string, string>);

    try {
      let gameIdToUse = gameId;  // Create mutable variable
      
      if (isEditing && typeof gameId === 'string') {
        await gameStorageService.updateGame(gameId, groups);
      } else {
        gameIdToUse = await gameStorageService.createGame(groups);
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

  // Helper function to calculate group distribution
  const calculateGroupDistribution = (totalPlayers: number): number[] => {
    if (totalPlayers < 4) return [];
    
    // Special cases
    switch (totalPlayers) {
      case 4: return [4];
      case 5: return [5];
      case 8: return [4, 4];
      case 9: return [4, 5];
      case 10: return [5, 5];
      case 12: return [4, 4, 4];
      case 13: return [4, 4, 5];
      case 14: return [4, 5, 5];
      case 15: return [5, 5, 5];
      case 16: return [4, 4, 4, 4];
      case 17: return [4, 4, 4, 5];
      case 18: return [4, 4, 5, 5];
      case 19: return [4, 5, 5, 5];
      case 20: return [5, 5, 5, 5];
    }
    
    // For any unexpected number of players (shouldn't happen due to validation)
    const numGroups = Math.ceil(totalPlayers / 5);
    const minPlayersPerGroup = 4;
    const distribution = new Array(numGroups).fill(minPlayersPerGroup);
    
    // Distribute remaining players
    let remaining = totalPlayers - (numGroups * minPlayersPerGroup);
    let groupIndex = numGroups - 1; // Start from last group
    
    while (remaining > 0) {
      distribution[groupIndex] += 1;
      remaining -= 1;
      groupIndex = (groupIndex - 1 + numGroups) % numGroups; // Move to previous group, wrap around
    }
    
    return distribution;
  };

  const validationMessage = getValidationMessage(selectedPlayers.length);
  const isValid = !validationMessage;

  return (
    <div className="container mx-auto p-4 pb-32 md:pb-4">
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

      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players
            .sort((a, b) => a.playerRank - b.playerRank)
            .map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                isSelected={selectedPlayers.includes(player.id)}
                onToggle={handlePlayerToggle}
              />
            ))}
        </div>
      </div>

      <ActionPanel
        selectedCount={selectedPlayers.length}
        maxPlayers={MAX_PLAYERS}
        isEditing={isEditing}
        validationMessage={validationMessage}
        isValid={isValid}
        onCreateGame={handleCreateGameDay}
        isMobile={true}
      />

      <ActionPanel
        selectedCount={selectedPlayers.length}
        maxPlayers={MAX_PLAYERS}
        isEditing={isEditing}
        validationMessage={validationMessage}
        isValid={isValid}
        onCreateGame={handleCreateGameDay}
      />
    </div>
  );
};

export default GamePlannerPage; 