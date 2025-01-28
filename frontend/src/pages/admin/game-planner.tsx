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
    
    // Calculate how many groups we need and how to distribute players
    let remainingPlayers = totalPlayers;
    const groups: Record<string, number[]> = {};
    let currentGroup = 1;

    while (remainingPlayers > 0) {
      // If remaining players can't fill a minimum group, add them to the last group
      if (remainingPlayers < 4) {
        groups[`Group ${currentGroup - 1}`] = selectedPlayerDetails.slice(totalPlayers - remainingPlayers).map(p => p.id);
        break;
      }

      // Determine group size
      let groupSize = 4;
      const playersAfterMinGroup = remainingPlayers - 4;
      const remainingGroups = Math.ceil(playersAfterMinGroup / 4);

      // If we have extra players, add them to the last groups
      if (playersAfterMinGroup > 0 && remainingGroups === 0) {
        groupSize = remainingPlayers;
      } else if (playersAfterMinGroup > 0 && 
                 playersAfterMinGroup < remainingGroups * 4) {
        // We need to distribute extra players to last groups
        const totalExtraPlayers = playersAfterMinGroup % 4;
        const groupsNeedingExtra = Math.ceil(totalExtraPlayers / (5 - 4));
        const isLastGroups = currentGroup > 4 - groupsNeedingExtra;
        
        if (isLastGroups) {
          groupSize = 5;
        }
      }

      // Create group and add players
      const startIdx = totalPlayers - remainingPlayers;
      groups[`Group ${currentGroup}`] = selectedPlayerDetails.slice(startIdx, startIdx + groupSize).map(p => p.id);
      
      remainingPlayers -= groupSize;
      currentGroup++;
    }

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