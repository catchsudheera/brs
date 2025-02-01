import React from 'react';
import { useRouter } from 'next/router';
import { usePlayers } from '@/hooks/usePlayers';
import { useGame } from '@/hooks/useGame';
import { GroupCard } from '@/components/game-day/GroupCard';
import { NavigationButtons } from '@/components/game-day/NavigationButtons';
import type { Player } from '@/types/player';

const GameDayPage = () => {
  const router = useRouter();
  const { gameId } = router.query;
  const { players, isLoading: playersLoading } = usePlayers();
  const { game, isLoading: gameLoading } = useGame(gameId as string);

  if (gameLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-error">Game not found</h1>
        <button 
          className="btn btn-primary mt-4"
          onClick={() => router.push('/admin/game-planner')}
        >
          Back to Game Planner
        </button>
      </div>
    );
  }

  // Convert player IDs to full player objects
  const groups = Object.entries(game.groups as Record<string, number[]>).reduce((acc, [groupName, playerIds]) => {
    acc[groupName] = playerIds
      .map(id => players.find(p => p.id === id))
      .filter((player): player is NonNullable<typeof player> => player !== undefined)
      .sort((a, b) => a.playerRank - b.playerRank);
    return acc;
  }, {} as Record<string, Player[]>);

  const handleBack = () => {
    router.push({
      pathname: '/admin/game-planner',
      query: { gameId }
    });
  };

  const handleContinue = () => {
    router.push({
      pathname: '/admin/score-keeper',
      query: { gameId }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Game Day Groups
        </h1>
        <p className="mt-2 text-sm sm:text-base text-base-content/60">
          Players and their groups for the game day
        </p>
      </div>

      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden border border-base-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
          {Object.entries(groups).map(([groupName, groupPlayers]) => (
            <GroupCard
              key={groupName}
              groupName={groupName}
              players={groupPlayers}
            />
          ))}
        </div>
      </div>

      <NavigationButtons
        onBack={handleBack}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default GameDayPage; 