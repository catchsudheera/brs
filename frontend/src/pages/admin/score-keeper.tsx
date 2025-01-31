import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { capitalizeFirstLetter } from '@/utils/string';
import { gameStorageService } from '@/services/gameStorageService';
import type { GameScore } from '@/services/gameStorageService';
import { validateEditPassword } from '@/utils/password';
import { useSession } from 'next-auth/react';
import { ProcessScoresModal } from '@/components/score-keeper/ProcessScoresModal';
import { getRefreshedSession } from '@/utils/auth';
import { usePlayers } from '@/hooks/usePlayers';
import { useGame } from '@/hooks/useGame';
import { gameService } from '@/services/gameService';
import { NavigationButtons } from '@/components/game-day/NavigationButtons';
import type { Player } from '@/types/player';

interface MatchCombination {
  team1: string[];
  team2: string[];
}

interface MatchScore {
  team1Score: number;
  team2Score: number;
  isSubmitted?: boolean;
}

interface GroupScores {
  [matchIndex: string]: MatchScore;
}

interface AllScores {
  [groupName: string]: GroupScores;
}

interface SelectedMatch {
  groupName: string;
  matchIndex: number;
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

const ScoreKeeperPage = () => {
  const router = useRouter();
  const { players, isLoading: playersLoading } = usePlayers();
  const gameId = router.query.gameId as string;
  const { data: session, status } = useSession();
  const { game, isLoading: gameLoading, mutate } = useGame(gameId as string);
  const [gameData, setGameData] = React.useState<GameScore | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeGroup, setActiveGroup] = useState<string>('Group 1');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingMatch, setPendingMatch] = useState<SelectedMatch | null>(null);
  const [passwordError, setPasswordError] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [showSubmitPasswordModal, setShowSubmitPasswordModal] = useState(false);
  const [submitPasswordError, setSubmitPasswordError] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showCancelPasswordModal, setShowCancelPasswordModal] = useState(false);
  const [cancelPasswordError, setCancelPasswordError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState(false);
  const [scores, setScores] = useState<Record<string, Record<string, MatchScore>>>({});

  // Memoize groups calculation
  const groups = useMemo(() => {
    return Object.entries(game?.groups as Record<string, number[]> || {}).reduce((acc, [groupName, playerIds]) => {
      acc[groupName] = playerIds
        .map(id => players.find(p => p.id === id))
        .filter((player): player is NonNullable<typeof player> => player !== undefined)
        .sort((a, b) => a.playerRank - b.playerRank);
      return acc;
    }, {} as Record<string, Player[]>);
  }, [game?.groups, players]);

  // Update score initialization effect
  useEffect(() => {
    if (!game?.groups || !players.length) return;

    // Initialize scores structure for each group
    const initialScores = Object.keys(game.groups as Record<string, number[]>).reduce((acc, groupName) => {
      const groupPlayers = groups[groupName];
      if (!groupPlayers) return acc;

      const matches = getMatchCombinations(groupPlayers.map(p => p.name));
      
      acc[groupName] = matches.reduce((matchScores, _, index) => {
        const existingScore = (game.scores as any)?.[groupName]?.[index.toString()] || { team1Score: 0, team2Score: 0 };
        matchScores[index.toString()] = existingScore;
        return matchScores;
      }, {} as Record<string, MatchScore>);
      
      return acc;
    }, {} as Record<string, Record<string, MatchScore>>);

    setScores(initialScores);
    setIsGameStarted(game.status === 'IN_PROGRESS');

  }, [game?.groups, game?.scores, game?.status, players, groups]); // Explicit dependencies

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);
  
  // Fetch game data from IndexedDB
  React.useEffect(() => {
    const fetchGame = async () => {
      if (typeof gameId !== 'string' || playersLoading) return;
      
      try {
        const game = await gameStorageService.getGame(gameId);
        if (game) {
          const gameWithScores = {
            ...game,
            scores: game.scores || {}
          };
          setGameData(gameWithScores);
          setIsGameStarted(!!game.isStarted); // Set from stored value
          
          // Set initial active group
          if (Object.keys(game.groups).length > 0 && !activeGroup) {
            setActiveGroup('Group 1');
          }
        } else {
          setGameData(null);
        }
      } catch (error) {
        console.error('Failed to fetch game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, activeGroup, playersLoading]);

  // Add cleanup effect
  useEffect(() => {
    // Cleanup function
    return () => {
      setScores({});
      setGameData(null);
      setSelectedMatch(null);
      setPendingMatch(null);
      setActiveGroup('Group 1');
      setIsGameStarted(false);
      setIsLoading(true);
      setSubmitError(null);
      setProcessError(null);
    };
  }, []);

  const handleScoreSubmit = async (team1Score: number, team2Score: number) => {
    if (!selectedMatch || !gameId) return;

    try {
      // Update local state
    const newScores = {
        ...scores,
      [selectedMatch.groupName]: {
          ...scores[selectedMatch.groupName],
        [selectedMatch.matchIndex]: { team1Score, team2Score }
      }
    };
      setScores(newScores);

      // Update DB
      await gameService.updateGame(gameId as string, {
        scores: newScores,
        status: 'IN_PROGRESS'
      });

      // Refresh game data
      await mutate();
      
      // Close score input
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to update scores:', error);
      // Optionally show error message to user
    }
  };

  const handleBack = () => {
    router.push(`/admin/game-day?gameId=${gameId}`, undefined, { shallow: false });
  };

  const handleCancelGame = () => {
    setShowCancelWarning(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelWarning(false);
    setShowCancelPasswordModal(true);
  };

  const handleCancelPasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordInput = (document.getElementById('cancel-password') as HTMLInputElement).value;
    
    if (validateEditPassword(passwordInput)) {
      try {
        if (typeof gameId === 'string') {
          await gameStorageService.deleteGame(gameId);
          router.push('/admin/dashboard', undefined, { shallow: false });
        }
      } catch (error) {
        console.error('Failed to delete game:', error);
        // Optionally show error notification
      }
    } else {
      setCancelPasswordError(true);
    }
  };

  const handleProcessScores = async () => {
    if (!gameId) return;
    
    setIsProcessing(true);
    setProcessError(null);
    
    try {
      await gameService.processGame(gameId);
      setProcessSuccess(true);
      router.push('/admin/dashboard', undefined, { shallow: false });
    } catch (error) {
      console.error('Error processing scores:', error);
      setProcessError(error instanceof Error ? error.message : 'Failed to process scores');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!gameId) return;

    setIsSubmitting(true);
    setSubmitProgress(0);
    setSubmitError(null);

    try {
      const result = await gameService.submitGame(gameId);
      
      // Handle partial success
      if ('errors' in result) {
        setSubmitError('Some matches failed to submit. Please try again for failed matches.');
        console.error('Failed matches:', result.errors);
      } else {
        // All matches submitted successfully, proceed to process
        await handleProcessScores();
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit game results');
    } finally {
      setIsSubmitting(false);
      setShowProcessModal(false);
    }
  };

  const handleStart = async () => {
    if (!gameId) return;

    try {
      await gameService.startGame(gameId as string);
      setIsGameStarted(true);
      await mutate(); // Refresh game data
    } catch (error) {
      console.error('Failed to start game:', error);
      // Optionally show an error message to the user
    }
  };

  if (status === 'loading' || gameLoading) {
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

  // Update score for a specific match
  const handleScoreChange = (groupName: string, matchIndex: string, score: MatchScore) => {
    setScores(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [matchIndex]: score
      }
    }));
  };

  const handleMatchClick = (groupName: string, matchIndex: number, match: MatchCombination) => {
    if (!isGameStarted) return;
    
    // Check if match already has scores
    const existingScore = scores[groupName]?.[matchIndex];
    const hasRealScores = existingScore && 
      (existingScore.team1Score > 0 || existingScore.team2Score > 0);

    if (hasRealScores) {
      // Store the match details and show password modal for existing non-zero scores
      setPendingMatch({
        groupName,
        matchIndex,
        team1: match.team1,
        team2: match.team2
      });
      setPasswordModalOpen(true);
    } else {
      // For new scores or 0-0 scores, no password needed
      setSelectedMatch({
        groupName,
        matchIndex,
        team1: match.team1,
        team2: match.team2
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordInput = (document.getElementById('edit-password') as HTMLInputElement).value;
    
    if (validateEditPassword(passwordInput)) {
      setPasswordModalOpen(false);
      setPasswordError(false);
      setSelectedMatch(pendingMatch);
      setPendingMatch(null);
    } else {
      setPasswordError(true);
    }
  };

  const handleSubmitResults = () => {
    const { totalGames, completedGames } = getGameStats(groups, scores);
    
    if (completedGames < totalGames) {
      setShowSubmitWarning(true);
    } else {
      setShowSubmitPasswordModal(true);
    }
  };

  const handleSubmitPasswordVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordInput = (document.getElementById('submit-password') as HTMLInputElement).value;
    
    if (validateEditPassword(passwordInput)) {
      setShowSubmitPasswordModal(false);
      setSubmitPasswordError(false);
      handleFinalSubmit();
    } else {
      setSubmitPasswordError(true);
    }
  };

  const getGameStats = (groups: Record<string, Player[]>, scores: Record<string, Record<string, MatchScore>>) => {
    let totalGames = 0;
    let completedGames = 0;

    Object.entries(groups).forEach(([groupName, players]) => {
      const matches = getMatchCombinations(players.map(p => p.name));
      totalGames += matches.length;

      // Count completed matches
      if (scores[groupName]) {
        Object.values(scores[groupName]).forEach(match => {
          if (match.team1Score > 0 || match.team2Score > 0) {
            completedGames++;
          }
        });
      }
    });

    return { totalGames, completedGames };
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Score Keeper
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Record match results for each group
        </p>
      </div>

      {/* Tab Navigation - Scrollable on mobile */}
      <div className="overflow-x-auto mb-6">
        <div className="tabs tabs-boxed inline-flex min-w-full justify-center">
          {Object.keys(groups)
            .filter(key => key !== 'management')
            .map((groupName) => (
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

      {/* Floating Management Button */}
      <button
        className="fixed bottom-6 right-6 btn btn-circle btn-primary shadow-lg"
        onClick={() => setActiveGroup('management')}
        title="Game Management"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Active Group Content */}
      {activeGroup === 'management' ? (
        <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Game Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Progress Section */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Game Progress</h3>
              {!isGameStarted ? (
                <div className="text-center p-6 bg-base-200 rounded-lg">
                  <p className="text-gray-600">Click Start Games to begin recording scores</p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={handleStart}
                  >
                    Start Games
                  </button>
                </div>
              ) : (
                <>
                  {(() => {
                    const { totalGames, completedGames } = getGameStats(groups, scores);
                    const progressPercent = Math.round((completedGames / totalGames) * 100);
                    
                    return (
                      <div className="p-6 bg-base-200 rounded-lg">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-primary">
                            {completedGames} / {totalGames}
                          </div>
                          <div className="text-sm text-gray-600">Games Completed</div>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                          {progressPercent}% Complete
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Actions Section */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Actions</h3>
              <div className="p-6 bg-base-200 rounded-lg space-y-4">
                {isGameStarted && (
                  <>
                  <button 
                    className="btn btn-primary w-full"
                      onClick={handleSubmitResults}
                  >
                    Submit Results
                  </button>
                    <button 
                      className="btn btn-error btn-outline w-full"
                      onClick={handleCancelGame}
                    >
                      Cancel Game
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeGroup && (
        <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Players</h2>
            <div className="flex flex-wrap gap-2">
              {groups[activeGroup].map((player) => (
                <div 
                  key={player.id} 
                  className="px-3 py-1 bg-base-200 rounded-lg text-sm font-medium"
                >
                  {capitalizeFirstLetter(player.name)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Matches</h2>
            <div className="space-y-3">
              {getMatchCombinations(groups[activeGroup].map(p => p.name)).map((match, idx) => {
                const matchScore = scores[activeGroup]?.[idx];
                const hasScore = !!matchScore;
                const isPlayed = hasScore && (matchScore.team1Score > 0 || matchScore.team2Score > 0);
                const team1Won = isPlayed && matchScore.team1Score > matchScore.team2Score;
                const team2Won = isPlayed && matchScore.team2Score > matchScore.team1Score;

                return (
                  <div 
                    key={idx} 
                    className={`bg-base-200 rounded-lg p-3 ${isGameStarted ? 'cursor-pointer hover:bg-base-300' : ''}`}
                    onClick={() => handleMatchClick(activeGroup, idx, match)}
                  >
                    <div className="grid grid-cols-11 gap-2 items-center">
                      <div className="col-span-4">
                        <div className={`text-center p-2 rounded ${
                          isPlayed 
                            ? (team1Won ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30') 
                            : 'bg-base-100'
                        }`}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {isPlayed && (
                              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                                team1Won 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {team1Won ? '✓' : '×'}
                              </span>
                            )}
                            <div className="text-xs font-medium">
                              {capitalizeFirstLetter(match.team1[0])}
                            </div>
                          </div>
                          <div className="text-xs font-medium">
                            {capitalizeFirstLetter(match.team1[1])}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <div className="font-bold text-lg">
                          {hasScore ? 
                            `${matchScore.team1Score} - ${matchScore.team2Score}` 
                            : 'vs'}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <div className={`text-center p-2 rounded ${
                          isPlayed 
                            ? (team2Won ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30') 
                            : 'bg-base-100'
                        }`}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {isPlayed && (
                              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                                team2Won 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {team2Won ? '✓' : '×'}
                              </span>
                            )}
                            <div className="text-xs font-medium">
                              {capitalizeFirstLetter(match.team2[0])}
                            </div>
                          </div>
                          <div className="text-xs font-medium">
                            {capitalizeFirstLetter(match.team2[1])}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Enter Password to Edit Score</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-control">
                <input
                  type="password"
                  id="edit-password"
                  className={`input input-bordered ${passwordError ? 'input-error' : ''}`}
                  placeholder="Enter password"
                  autoComplete="off"
                />
                {passwordError && (
                  <label className="label">
                    <span className="label-text-alt text-error">Incorrect password</span>
                  </label>
                )}
              </div>
              <div className="modal-action">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPasswordError(false);
                    setPendingMatch(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setPasswordModalOpen(false);
              setPasswordError(false);
              setPendingMatch(null);
            }}>
              close
            </button>
          </form>
        </dialog>
      )}

      {/* Existing Score Input Modal */}
      {selectedMatch && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Enter Match Score</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-center">
                  {selectedMatch.team1.map(capitalizeFirstLetter).join(' & ')}
                </div>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  defaultValue={scores[selectedMatch.groupName]?.[selectedMatch.matchIndex]?.team1Score || 0}
                  min={0}
                  max={MAX_POINTS}
                  id="team1Score"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    if (input.value && !isValidScore(parseInt(input.value))) {
                      input.value = input.value.slice(0, -1);
                    }
                  }}
                />
              </div>
              <div className="text-center font-bold">vs</div>
              <div className="space-y-2">
                <div className="font-medium text-center">
                  {selectedMatch.team2.map(capitalizeFirstLetter).join(' & ')}
                </div>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  defaultValue={scores[selectedMatch.groupName]?.[selectedMatch.matchIndex]?.team2Score || 0}
                  min={0}
                  max={MAX_POINTS}
                  id="team2Score"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    if (input.value && !isValidScore(parseInt(input.value))) {
                      input.value = input.value.slice(0, -1);
                    }
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              * Scores must be between 0 and {MAX_POINTS} points
              <br />
              * Scores cannot be equal
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedMatch(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const team1Score = parseInt((document.getElementById('team1Score') as HTMLInputElement).value);
                  const team2Score = parseInt((document.getElementById('team2Score') as HTMLInputElement).value);
                  
                  if (!areValidMatchScores(team1Score, team2Score)) {
                    alert('Invalid scores. Please check the requirements and try again.');
                    return;
                  }
                  
                  handleScoreSubmit(team1Score, team2Score);
                }}
              >
                Save Score
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedMatch(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Submit Password Modal */}
      {showSubmitPasswordModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Results Submission</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please enter password to submit the final results.
            </p>
            <form onSubmit={handleSubmitPasswordVerify}>
              <div className="form-control">
                <input
                  type="password"
                  id="submit-password"
                  className={`input input-bordered ${submitPasswordError ? 'input-error' : ''}`}
                  placeholder="Enter password"
                  autoComplete="off"
                />
                {submitPasswordError && (
                  <label className="label">
                    <span className="label-text-alt text-error">Incorrect password</span>
                  </label>
                )}
              </div>
              <div className="modal-action">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowSubmitPasswordModal(false);
                    setSubmitPasswordError(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Results
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setShowSubmitPasswordModal(false);
              setSubmitPasswordError(false);
            }}>
              close
            </button>
          </form>
        </dialog>
      )}

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <dialog className="modal modal-open">
          <div className="modal-box border-2 border-warning">
            <div className="flex items-start gap-3 mb-4">
              <svg 
                className="w-6 h-6 text-warning flex-shrink-0 mt-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <div>
                <h3 className="font-bold text-lg text-warning">Warning: Incomplete Matches</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Some matches have not been completed. Submitting now will finalize the game with missing scores.
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-outline"
                onClick={() => setShowSubmitWarning(false)}
              >
                Go Back
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => {
                  setShowSubmitWarning(false);
                  setTimeout(() => {
                    setShowSubmitPasswordModal(true);
                  }, 100);
                }}
              >
                Submit Incomplete Results
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowSubmitWarning(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Cancel Warning Modal */}
      {showCancelWarning && (
        <dialog className="modal modal-open">
          <div className="modal-box border-2 border-error">
            <div className="flex items-start gap-3 mb-4">
              <svg 
                className="w-6 h-6 text-error flex-shrink-0 mt-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <div>
                <h3 className="font-bold text-lg text-error">Warning: Cancel Game</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  This will delete all recorded scores and cannot be undone. Are you sure you want to continue?
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-outline"
                onClick={() => setShowCancelWarning(false)}
              >
                Go Back
              </button>
              <button 
                className="btn btn-error"
                onClick={handleCancelConfirm}
              >
                Cancel Game
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCancelWarning(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Cancel Password Modal */}
      {showCancelPasswordModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Game Cancellation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please enter password to confirm game cancellation.
            </p>
            <form onSubmit={handleCancelPasswordVerify}>
              <div className="form-control">
                <input
                  type="password"
                  id="cancel-password"
                  className={`input input-bordered ${cancelPasswordError ? 'input-error' : ''}`}
                  placeholder="Enter password"
                  autoComplete="off"
                />
                {cancelPasswordError && (
                  <label className="label">
                    <span className="label-text-alt text-error">Incorrect password</span>
                  </label>
                )}
              </div>
              <div className="modal-action">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCancelPasswordModal(false);
                    setCancelPasswordError(false);
                  }}
                >
                  Go Back
                </button>
                <button type="submit" className="btn btn-error">
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setShowCancelPasswordModal(false);
              setCancelPasswordError(false);
            }}>
              close
            </button>
          </form>
        </dialog>
      )}

      {/* Submission Progress Modal */}
      {isSubmitting && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Submitting Results</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${submitProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {submitProgress.toFixed(0)}% Complete
            </p>
            {submitError && (
              <div className="mt-4 p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-error text-sm">{submitError}</p>
              </div>
            )}
          </div>
        </dialog>
      )}

      <ProcessScoresModal
        isOpen={showProcessModal}
        isProcessing={isProcessing}
        error={processError}
        success={processSuccess}
        onProcess={handleProcessScores}
        onRetry={handleProcessScores}
        onClose={() => {
          if (processSuccess || (!processError && !isProcessing)) {
            setShowProcessModal(false);
            setProcessError(null);
            setProcessSuccess(false);
            router.push('/admin/dashboard', undefined, { shallow: false });
          } else {
            setShowProcessModal(false);
            setProcessError(null);
          }
        }}
      />
    </div>
  );
};

export default ScoreKeeperPage; 