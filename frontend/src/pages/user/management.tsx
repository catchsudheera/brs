import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMyMatches } from '@/hooks/useMyMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { capitalizeFirstLetter } from '@/utils/string';
import { userScoreService } from '@/services/userScoreService';
import { MatchSelector } from '@/components/score-keeper/MatchSelector';
import { ScoreInput } from '@/components/score-keeper/ScoreInput';

interface SelectedMatch {
  gameId: string;
  groupName: string;
  matchIndex: number;
  team1: string[];
  team2: string[];
}

interface GameMatch {
  groupName: string;
  matchIndex: number;
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isPlayerInTeam1: boolean;
}

const MAX_POINTS = 30;

const isValidScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= MAX_POINTS;
};

const areValidMatchScores = (team1Score: number, team2Score: number): boolean => {
  return (
    isValidScore(team1Score) &&
    isValidScore(team2Score) &&
    team1Score !== team2Score
  );
};

const UserManagementPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { games, isLoading: matchesLoading, mutate: refreshMatches } = useMyMatches();
  const { players, isLoading: playersLoading } = usePlayers();
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);
  const [scores, setScores] = useState<{
    team1Score: number;
    team2Score: number;
  }>({ team1Score: 0, team2Score: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && !session.user.accessLevel?.includes('USER')) {
      router.push('/');
    }
  }, [status, session, router]);

  const getPlayerName = (id: string) => {
    const player = players.find(p => p.id === parseInt(id));
    return player ? player.name : id;
  };

  const handleMatchSelect = (match: SelectedMatch) => {
    // Find current scores for this match
    const game = games.find(g => g.id === match.gameId);
    const matchData = game?.matches.find(
      (m: GameMatch) => m.groupName === match.groupName && m.matchIndex === match.matchIndex
    );
    
    if (matchData?.team1Score || matchData?.team2Score) {
      // If scores exist, they can't be edited
      setScores({
        team1Score: matchData.team1Score,
        team2Score: matchData.team2Score
      });
    } else {
      setSelectedMatch(match);
      setScores({ team1Score: 0, team2Score: 0 });
      setShowScoreModal(true);
    }
  };

  const handleScoreChange = (team1: number, team2: number) => {
    setScores({ team1Score: team1, team2Score: team2 });
  };

  const handleScoreSubmit = async () => {
    if (!selectedMatch || !areValidMatchScores(scores.team1Score, scores.team2Score)) return;
    
    setIsSubmitting(true);
    try {
      await userScoreService.submitScore({
        gameId: selectedMatch.gameId,
        groupName: selectedMatch.groupName,
        matchIndex: selectedMatch.matchIndex,
        team1Score: scores.team1Score,
        team2Score: scores.team2Score
      });
      
      await refreshMatches();
      setSelectedMatch(null);
      setScores({ team1Score: 0, team2Score: 0 });
      setShowScoreModal(false);
    } catch (error) {
      console.error('Failed to submit score:', error);
      // TODO: Add error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || matchesLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session?.user?.accessLevel?.includes('USER')) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Your Matches
          </h1>
          <p className="mt-2 text-base-content/60">
            View and update scores for your matches
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {games.length === 0 ? (
            <div className="text-center py-12 bg-base-200 rounded-lg border border-base-300">
              <div className="text-5xl mb-4">🎭</div>
              <h3 className="text-lg font-medium">No Active Matches</h3>
              <p className="text-base-content/60 mt-2">
                You don&apos;t have any matches in progress at the moment
              </p>
            </div>
          ) : (
            games.map((game) => (
              <div key={game.id} className="bg-base-200 rounded-lg overflow-hidden border border-base-300">
                <div className="bg-base-300/50 px-6 py-4 border-b border-base-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <h3 className="font-semibold">
                        Game {game.id.slice(-6)}
                      </h3>
                    </div>
                    <span className="text-sm text-base-content/60">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-base-200">
                  {game.matches.map((match) => (
                    <div
                      key={`${match.groupName}-${match.matchIndex}`}
                      className="hover:bg-base-100 transition-colors cursor-pointer"
                      onClick={() => !match.team1Score && !match.team2Score && handleMatchSelect({
                        gameId: game.id,
                        groupName: match.groupName,
                        matchIndex: match.matchIndex,
                        team1: match.team1,
                        team2: match.team2
                      })}
                    >
                      <div className="grid grid-cols-12 items-center">
                        {/* Team 1 */}
                        <div className={`col-span-5 p-4 ${
                          match.team1Score > match.team2Score 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : match.team1Score || match.team2Score 
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : ''
                        }`}>
                          <div className="flex items-center gap-2">
                            {match.team1Score > match.team2Score && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px]">
                                ✓
                              </span>
                            )}
                            {match.team1Score < match.team2Score && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px]">
                                ×
                              </span>
                            )}
                            <div className="font-medium text-sm">
                              {match.team1.map(id => capitalizeFirstLetter(getPlayerName(id))).join(' & ')}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="font-bold text-base">
                            {match.team1Score || match.team2Score 
                              ? `${match.team1Score} - ${match.team2Score}`
                              : 'vs'}
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className={`col-span-5 p-4 ${
                          match.team2Score > match.team1Score 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : match.team1Score || match.team2Score 
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : ''
                        }`}>
                          <div className="flex items-center gap-2">
                            {match.team2Score > match.team1Score && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px]">
                                ✓
                              </span>
                            )}
                            {match.team2Score < match.team1Score && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px]">
                                ×
                              </span>
                            )}
                            <div className="font-medium text-sm">
                              {match.team2.map(id => capitalizeFirstLetter(getPlayerName(id))).join(' & ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Score Input Modal */}
      <dialog className={`modal ${showScoreModal ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-lg">
          <h3 className="text-2xl font-bold text-center mb-8">Enter Match Score</h3>
          {selectedMatch && (
            <div className="space-y-8">
              {/* Team 1 */}
              <div className="space-y-2">
                <div className="text-lg font-medium text-center">
                  {selectedMatch.team1.map(id => capitalizeFirstLetter(getPlayerName(id))).join(' & ')}
                </div>
                <input
                  type="number"
                  className="input input-bordered w-full text-center text-xl h-16"
                  value={scores.team1Score || ''}
                  onChange={(e) => handleScoreChange(parseInt(e.target.value) || 0, scores.team2Score)}
                  min={0}
                  max={30}
                  placeholder="0"
                />
              </div>

              {/* VS */}
              <div className="text-2xl font-medium text-center text-base-content/60">
                vs
              </div>

              {/* Team 2 */}
              <div className="space-y-2">
                <div className="text-lg font-medium text-center">
                  {selectedMatch.team2.map(id => capitalizeFirstLetter(getPlayerName(id))).join(' & ')}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    className="input input-bordered w-full text-center text-xl h-16"
                    value={scores.team2Score || ''}
                    onChange={(e) => handleScoreChange(scores.team1Score, parseInt(e.target.value) || 0)}
                    min={0}
                    max={30}
                    placeholder="0"
                  />
                  <div className="absolute right-3 inset-y-0 flex flex-col justify-center pointer-events-none opacity-60">
                    <div className="cursor-pointer">▲</div>
                    <div className="cursor-pointer">▼</div>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-1 text-base-content/60 text-sm">
                <p>* Scores must be between 0 and 30 points</p>
                <p>* Scores cannot be equal</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  className="btn btn-outline min-w-[120px]"
                  onClick={() => {
                    setShowScoreModal(false);
                    setSelectedMatch(null);
                    setScores({ team1Score: 0, team2Score: 0 });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
                  onClick={handleScoreSubmit}
                  disabled={isSubmitting || !areValidMatchScores(scores.team1Score, scores.team2Score)}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Score'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowScoreModal(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UserManagementPage; 