import { useRouter } from 'next/router';
import { useGame } from '@/hooks/useGame';
import { usePlayers } from '@/hooks/usePlayers';
import { capitalizeFirstLetter } from '@/utils/string';
import { useState, useEffect } from 'react';
import type { Player } from '@/types/player';
import { getMatchCombinations, type MatchCombination } from '@/utils/match';

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
          <p className="text-base-content/50">The game you&apos;re looking for doesn&apos;t exist</p>
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
          {/* Live badge with enhanced styling */}
          <div className="bg-red-500/10 px-3 py-1 rounded-full mb-3 border border-red-500/20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-red-500 font-medium tracking-wider text-sm">LIVE MATCH</span>
            </div>
          </div>
          
          {/* Game title with badminton icon */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏸</span>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Game #{gameId.slice(-4)}
            </h1>
          </div>
          
          {/* Live updates badge */}
          <div className="mt-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="tracking-wide">Live updates enabled</span>
            </div>
          </div>
        </div>

        {/* Progress Card with sports theme */}
        <div className="mt-8 animate-slideUp">
          <div className="bg-base-200 rounded-lg border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-base-300 bg-base-300/30">
              <h2 className="font-semibold text-base-content/70">Match Progress</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-base-content/70">Matches Completed</span>
                  <div className="px-2 py-0.5 bg-primary/10 rounded text-xs font-medium text-primary">
                    {Object.values(liveGame.scores).reduce((total, groupScores) => {
                      return total + Object.values(groupScores).filter(score => 
                        score.team1Score > 0 || score.team2Score > 0
                      ).length;
                    }, 0)} of {Object.values(liveGame.groups).reduce((total, group) => {
                      return total + (group.length === 4 ? 3 : 5);
                    }, 0)}
                  </div>
                </div>
                <div className="text-xs font-medium text-base-content/50">
                  Updated live
                </div>
              </div>
              <div className="w-full bg-base-300 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{ 
                    width: `${Math.round((Object.values(liveGame.scores).reduce((total, groupScores) => {
                      return total + Object.values(groupScores).filter(score => 
                        score.team1Score > 0 || score.team2Score > 0
                      ).length;
                    }, 0) / Object.values(liveGame.groups).reduce((total, group) => {
                      return total + (group.length === 4 ? 3 : 5);
                    }, 0)) * 100)}%` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups section with enhanced styling */}
      <div className="space-y-4">
        {Object.entries(liveGame.groups).map(([groupName, playerIds], groupIndex) => (
          <div 
            key={groupName} 
            className="bg-base-200 rounded-lg transform opacity-0 animate-slideInFromRight overflow-hidden"
            style={{ animationDelay: `${groupIndex * 150}ms` }}
          >
            <div className="px-4 py-3 bg-base-300/30 border-b border-base-300">
              <h2 className="font-semibold text-base-content/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {groupName}
              </h2>
            </div>
            <div className="p-4 space-y-3">
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