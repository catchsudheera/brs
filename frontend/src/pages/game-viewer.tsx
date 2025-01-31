import { useRouter } from 'next/router';
import { useGame } from '@/hooks/useGame';
import { usePlayers } from '@/hooks/usePlayers';
import { capitalizeFirstLetter } from '@/utils/string';
import { useState, useEffect } from 'react';
import type { Player } from '@/types/player';

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

const LiveIndicator = () => (
  <div className="flex items-center gap-2">
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
    <span className="text-red-500 font-medium">LIVE</span>
  </div>
);

const GameViewer = () => {
  const router = useRouter();
  const gameId = router.query.gameId as string;
  const { game, isLoading: gameLoading } = useGame(gameId);
  const { players, isLoading: playersLoading } = usePlayers();
  const [activeGroup, setActiveGroup] = useState<string>('Group 1');

  // Convert player IDs to full player objects
  const groups = Object.entries(game?.groups as Record<string, number[]> || {}).reduce((acc, [groupName, playerIds]) => {
    acc[groupName] = playerIds
      .map(id => players.find(p => p.id === id))
      .filter((player): player is NonNullable<typeof player> => player !== undefined)
      .sort((a, b) => a.playerRank - b.playerRank);
    return acc;
  }, {} as Record<string, Player[]>);

  const scores = game?.scores as Record<string, Record<string, { team1Score: number; team2Score: number }>> || {};

  if (gameLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Game not found</h1>
          <p className="text-gray-500 mt-2">The game you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex flex-col items-center">
          {/* Live indicator */}
          <LiveIndicator />
          
          {/* Game title */}
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Game #{gameId.slice(-4)}
          </h1>
          
          {/* Last updated indicator */}
          <p className="mt-2 text-sm text-gray-500">
            Auto-refreshing every 30 seconds
          </p>
        </div>

        {/* Progress Card with enhanced styling */}
        <div className="mt-6">
          <div className="bg-base-200 p-6 rounded-lg border border-base-300 shadow-lg">
            <div className="text-center mb-4">
              <div className="flex justify-center items-center gap-3 mb-2">
                <div className="text-3xl font-bold text-primary">
                  {Object.values(scores).reduce((total, groupScores) => {
                    return total + Object.values(groupScores).filter(score => 
                      score.team1Score > 0 || score.team2Score > 0
                    ).length;
                  }, 0)}
                </div>
                <div className="text-2xl font-bold text-base-content/50">
                  /
                </div>
                <div className="text-3xl font-bold text-primary/70">
                  {Object.values(groups).reduce((total, group) => {
                    return total + (group.length === 4 ? 3 : 5);
                  }, 0)}
                </div>
              </div>
              <div className="text-base text-base-content/70 font-medium">Matches Completed</div>
            </div>
            <div className="w-full bg-base-300 rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.round((Object.values(scores).reduce((total, groupScores) => {
                    return total + Object.values(groupScores).filter(score => 
                      score.team1Score > 0 || score.team2Score > 0
                    ).length;
                  }, 0) / Object.values(groups).reduce((total, group) => {
                    return total + (group.length === 4 ? 3 : 5);
                  }, 0)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Group Tabs */}
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

      {/* Matches */}
      <div className="space-y-4">
        {(() => {
          const groupPlayers = groups[activeGroup] || [];
          const matches = getMatchCombinations(groupPlayers.map(p => p.name));

          return matches.map((match, idx) => {
            const matchScore = scores[activeGroup]?.[idx];
            const hasScore = !!matchScore;
            const isPlayed = hasScore && (matchScore.team1Score > 0 || matchScore.team2Score > 0);
            const team1Won = isPlayed && matchScore.team1Score > matchScore.team2Score;

            return (
              <div key={idx} className="bg-base-200 rounded-lg p-4">
                <div className="grid grid-cols-11 gap-4 items-center">
                  <div className="col-span-4">
                    <div className={`text-center p-3 rounded ${
                      isPlayed 
                        ? (team1Won ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30') 
                        : 'bg-base-100'
                    }`}>
                      <div className="sm:flex sm:items-center sm:justify-center sm:gap-2">
                        {isPlayed && (
                          <>
                            {/* Mobile indicator (above text) */}
                            <div className="flex justify-center mb-2 sm:hidden">
                              <span className={`flex items-center justify-center w-5 h-5 rounded-full ${
                                team1Won 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {team1Won ? '✓' : '×'}
                              </span>
                            </div>
                            {/* Desktop indicator (inline) */}
                            <div className="hidden sm:block">
                              <span className={`flex items-center justify-center w-5 h-5 rounded-full ${
                                team1Won 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {team1Won ? '✓' : '×'}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="font-medium">
                          {match.team1.map(capitalizeFirstLetter).join(' & ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <div className="font-bold text-2xl">
                      {hasScore ? `${matchScore.team1Score} - ${matchScore.team2Score}` : 'vs'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className={`text-center p-3 rounded ${
                      isPlayed 
                        ? (!team1Won ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30') 
                        : 'bg-base-100'
                    }`}>
                      <div className="sm:flex sm:items-center sm:justify-center sm:gap-2">
                        {isPlayed && (
                          <>
                            {/* Mobile indicator (above text) */}
                            <div className="flex justify-center mb-2 sm:hidden">
                              <span className={`flex items-center justify-center w-5 h-5 rounded-full ${
                                !team1Won 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {!team1Won ? '✓' : '×'}
                              </span>
                            </div>
                            {/* Desktop indicator (inline) */}
                            <div className="hidden sm:block">
                              <span className={`flex items-center justify-center w-5 h-5 rounded-full ${
                                !team1Won 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {!team1Won ? '✓' : '×'}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="font-medium">
                          {match.team2.map(capitalizeFirstLetter).join(' & ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default GameViewer; 