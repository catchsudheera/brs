import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGamePlayers } from '@/hooks/useGamePlayers';
import { useGame } from '@/hooks/useGame';
import { useSession } from 'next-auth/react';
import { gameService } from '@/services/gameService';
import { PlayerCard } from '@/components/game-planner/PlayerCard';
import { ActionPanel } from '@/components/game-planner/ActionPanel';
import { isValidPlayerCount } from '@/utils/game-validation';

const MAX_PLAYERS = 20;

const GamePlannerPage = () => {
  const router = useRouter();
  const { players, isLoading: playersLoading } = useGamePlayers();
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const gameId = router.query.gameId as string;
  const { game, isLoading: gameLoading } = useGame(gameId as string);

  // Load existing game data if editing
  useEffect(() => {
    if (game) {
      setIsEditing(true);
      const selectedIds = Object.values(game.groups as Record<string, number[]>)
        .flat()
        .filter((id, index, self) => self.indexOf(id) === index);
      setSelectedPlayers(selectedIds);
    }
  }, [game]);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
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

    try {
      const gameData = {
        groups,
        scores: {},
        status: 'DRAFT' as const
      };

      if (isEditing && gameId) {
        await gameService.updateGame(gameId, gameData);
        router.push(`/admin/game-day?gameId=${gameId}`);
      } else {
        const newGame = await gameService.createGame(gameData);
        router.push(`/admin/game-day?gameId=${newGame.id}`);
      }
    } catch (error) {
      console.error('Failed to create/update game:', error);
      // Show error toast/notification
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