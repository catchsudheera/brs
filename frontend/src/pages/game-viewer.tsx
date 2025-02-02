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

// Add proper type for the game
interface LiveGame {
  id: string;
  groups: Record<string, number[]>;
  scores: Record<string, Record<string, { team1Score: number; team2Score: number }>>;
  status: string;
}

const useGameLiveUpdates = (gameId: string | undefined) => {
  const [liveGame, setLiveGame] = useState<LiveGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    try {
      const eventSource = new EventSource(`/api/games/${gameId}/live`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLiveGame(data);
        setIsLoading(false);
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        setIsLoading(false);
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('SSE Setup Error:', error);
      setIsLoading(false);
    }
  }, [gameId]);

  return { liveGame, isLoading };
};

const GameViewer = () => {
  const router = useRouter();
  const gameId = router.query.gameId as string;
  const { players, isLoading: playersLoading } = usePlayers();
  const { liveGame, isLoading: gameLoading } = useGameLiveUpdates(gameId);

  // Convert player IDs to names
  const getPlayerName = (id: number) => {
    const player = players.find(p => p.id === id);
    return player ? player.name : `Player ${id}`;
  };

  // Show loading state while either data is loading
  if (playersLoading || gameLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!liveGame) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-base-content/70">Game not found</h1>
          <p className="text-base-content/50">The game you're looking for doesn't exist</p>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => router.push('/')}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex flex-col items-center animate-fadeIn">
          {/* Live indicator with pulse effect */}
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-500 font-medium tracking-wide">LIVE</span>
          </div>
          
          {/* Game title with gradient */}
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Game #{gameId.slice(-4)}
          </h1>
          
          {/* Live updates indicator */}
          <div className="mt-2 flex items-center gap-2 text-sm text-base-content/50">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live updates enabled</span>
          </div>
        </div>

        {/* Progress Card with enhanced styling */}
        <div className="mt-6 animate-slideUp">
          <div className="bg-base-200 px-4 py-3 rounded-lg border border-base-300 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-base-content/70">Matches Completed</span>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-lg font-bold text-primary animate-pulse">
                  {Object.values(liveGame.scores).reduce((total, groupScores) => {
                    return total + Object.values(groupScores).filter(score => 
                      score.team1Score > 0 || score.team2Score > 0
                    ).length;
                  }, 0)}
                </span>
                <span className="text-base-content/50">/</span>
                <span className="text-lg font-bold text-primary/70">
                  {Object.values(liveGame.groups).reduce((total, group) => {
                    return total + (group.length === 4 ? 3 : 5);
                  }, 0)}
                </span>
              </div>
            </div>
            <div className="w-full bg-base-300 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.round((Object.values(liveGame.scores).reduce((total, groupScores) => {
                    return total + Object.values(groupScores).filter(score => 
                      score.team1Score > 0 || score.team2Score > 0
                    ).length;
                  }, 0) / Object.values(liveGame.groups).reduce((total, group) => {
                    return total + (group.length === 4 ? 3 : 5);
                  }, 0)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Groups and Matches with staggered animation */}
      <div className="space-y-4">
        {Object.entries(liveGame.groups).map(([groupName, playerIds], groupIndex) => (
          <div 
            key={groupName} 
            className="bg-base-200 p-4 rounded-lg transform opacity-0 animate-slideInFromRight"
            style={{ animationDelay: `${groupIndex * 150}ms` }}
          >
            <h2 className="text-base font-semibold mb-3 text-base-content/70">{groupName}</h2>
            <div className="space-y-2">
              {(() => {
                const matches = getMatchCombinations(playerIds.map(id => getPlayerName(id)));

                return matches.map((match, idx) => {
                  const matchScore = liveGame.scores[groupName]?.[idx];
                  const hasScore = !!matchScore;
                  const isPlayed = hasScore && (matchScore.team1Score > 0 || matchScore.team2Score > 0);
                  const team1Won = isPlayed && matchScore.team1Score > matchScore.team2Score;

                  return (
                    <div key={idx} className="bg-base-100 rounded p-2">
                      <div className="grid grid-cols-11 gap-2 items-center">
                        <div className="col-span-4">
                          <div className={`text-center py-1.5 px-2 rounded ${isPlayed
                            ? (team1Won ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')
                            : 'bg-base-100'
                          }`}>
                            <div className="flex items-center justify-center gap-1">
                              {isPlayed && (
                                <span className={`flex items-center justify-center w-3.5 h-3.5 rounded-full text-[10px] ${
                                  team1Won ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                                }`}>
                                  {team1Won ? '✓' : '×'}
                                </span>
                              )}
                              <div className="font-medium text-xs">
                                {match.team1.map(capitalizeFirstLetter).join(' & ')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 text-center">
                          <div className="font-bold text-base">
                            {hasScore ? `${matchScore.team1Score} - ${matchScore.team2Score}` : 'vs'}
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div className={`text-center py-1.5 px-2 rounded ${isPlayed
                            ? (!team1Won ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')
                            : 'bg-base-100'
                          }`}>
                            <div className="flex items-center justify-center gap-1">
                              {isPlayed && (
                                <span className={`flex items-center justify-center w-3.5 h-3.5 rounded-full text-[10px] ${
                                  !team1Won ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                                }`}>
                                  {!team1Won ? '✓' : '×'}
                                </span>
                              )}
                              <div className="font-medium text-xs">
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
        ))}
      </div>
    </div>
  );
};

export default GameViewer; 