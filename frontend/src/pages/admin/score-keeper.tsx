import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { capitalizeFirstLetter } from '@/utils/string';
import { gameStorageService } from '@/services/gameStorageService';
import type { GameScore } from '@/services/gameStorageService';
import { validateEditPassword } from '@/utils/password';
import { useSession, getSession } from 'next-auth/react';
import { ProcessScoresModal } from '@/components/score-keeper/ProcessScoresModal';
import { getRefreshedSession } from '@/utils/auth';

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

// Add helper function to count games
const getGameStats = (groups: Record<string, any>, scores: Record<string, any>) => {
  let totalGames = 0;
  let completedGames = 0;

  Object.entries(groups).forEach(([groupName, players]) => {
    const matchCount = getMatchCombinations((players as any[]).map(p => p.name)).length;
    totalGames += matchCount;
    
    if (scores[groupName]) {
      Object.values(scores[groupName]).forEach((score: any) => {
        if (score.team1Score > 0 || score.team2Score > 0) {
          completedGames++;
        }
      });
    }
  });

  return { totalGames, completedGames };
};

const ScoreKeeperPage = () => {
  const router = useRouter();
  const { players } = usePlayerContext();
  const { gameId } = router.query;
  const [gameData, setGameData] = React.useState<GameScore | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeGroup, setActiveGroup] = useState<string>('');
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
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState(false);
  
  // Fetch game data from IndexedDB
  React.useEffect(() => {
    const fetchGame = async () => {
      if (typeof gameId !== 'string') return;
      
      try {
        const game = await gameStorageService.getGame(gameId);
        if (game) {
          // Initialize scores if they don't exist
          const gameWithScores = {
            ...game,
            scores: game.scores || {}  // Ensure scores object exists
          };
          setGameData(gameWithScores);
          setIsGameStarted(!!game.isStarted); // Set from stored value
          
          // Set initial active group
          if (Object.keys(game.groups).length > 0 && !activeGroup) {
            setActiveGroup(Object.keys(game.groups)[0]);
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
  }, [gameId, activeGroup]);

  const handleScoreSubmit = async (team1Score: number, team2Score: number) => {
    if (!selectedMatch || !gameData || typeof gameId !== 'string') return;

    const newScores = {
      ...gameData.scores || {},
      [selectedMatch.groupName]: {
        ...(gameData.scores?.[selectedMatch.groupName] || {}),
        [selectedMatch.matchIndex]: { team1Score, team2Score }
      }
    };

    try {
      await gameStorageService.updateGameScores(gameId, newScores);
      setGameData({
        ...gameData,
        scores: newScores
      });
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to update scores:', error);
    }
  };

  const handleBack = () => {
    router.push({
      pathname: '/admin/game-day',
      query: { gameId }
    });
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
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Failed to delete game:', error);
        // Optionally show error notification
      }
    } else {
      setCancelPasswordError(true);
    }
  };

  const submitMatchResult = async (
    date: string,
    team1Players: number[],
    team2Players: number[],
    team1Score: number,
    team2Score: number
  ) => {
    // Get fresh session before submitting
    const session = await getRefreshedSession();
    if (!session?.accessToken) {
      throw new Error("No access token available");
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/encounters/${date}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        team1: {
          player1: team1Players[0],
          player2: team1Players[1],
          setPoints: team1Score
        },
        team2: {
          player1: team2Players[0],
          player2: team2Players[1],
          setPoints: team2Score
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit result: ${response.statusText}`);
    }
  };

  const handleProcessScores = async () => {
    setIsProcessing(true);
    setProcessError(null);
    
    try {
      // Get fresh session before processing
      const session = await getRefreshedSession();
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/encounters/${gameId}/process`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          }
        }
      );

      const errorText = await response.text();
      
      if (!response.ok) {
        throw new Error(
          response.status === 403 
            ? 'Not authorized to process scores' 
            : errorText || 'Failed to process scores'
        );
      }

      // Delete game from IndexedDB on success
      if (typeof gameId === 'string') {
        await gameStorageService.deleteGame(gameId);
      }
      
      // Set success state
      setProcessSuccess(true);
    } catch (error) {
      console.error('Error processing scores:', error);
      setProcessError(error instanceof Error ? error.message : 'Failed to process scores');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!gameData || typeof gameId !== 'string') return;

    // First check if there are any unsubmitted scores
    let hasUnsubmittedScores = false;
    let hasScores = false;

    Object.values(gameData.scores).forEach(matches => {
      Object.values(matches).forEach(score => {
        if (score.team1Score > 0 || score.team2Score > 0) {
          hasScores = true;
          if (!score.isSubmitted) {
            hasUnsubmittedScores = true;
          }
        }
      });
    });

    // If all scores are already submitted, show process modal directly
    if (hasScores && !hasUnsubmittedScores) {
      setShowProcessModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);
    setSubmitError(null);

    const date = gameId;
    let totalMatches = 0;
    let completedMatches = 0;
    const updatedScores: AllScores = { ...gameData.scores };

    // Count total unsubmitted matches to submit
    Object.entries(gameData.scores).forEach(([_, matches]) => {
      Object.values(matches).forEach(score => {
        if ((score.team1Score > 0 || score.team2Score > 0) && !score.isSubmitted) {
          totalMatches++;
        }
      });
    });

    try {
      for (const [groupName, matches] of Object.entries(gameData.scores)) {
        const groupPlayers = gameData.groups[groupName];
        updatedScores[groupName] = { ...matches };
        
        for (const [matchIndex, score] of Object.entries(matches)) {
          // Skip if no scores or already submitted
          if (score.isSubmitted || (score.team1Score === 0 && score.team2Score === 0)) {
            continue;
          }

          const matchCombinations = getMatchCombinations(
            groupPlayers.map(id => players.find(p => p.id === id)?.name || '')
          );
          const matchIndexNum = parseInt(matchIndex);
          const match = matchCombinations[matchIndexNum];
          
          const team1Players = match.team1.map(name => 
            players.find(p => p.name === name)?.id
          ).filter((id): id is number => id !== undefined);
          
          const team2Players = match.team2.map(name => 
            players.find(p => p.name === name)?.id
          ).filter((id): id is number => id !== undefined);

          try {
            await submitMatchResult(
              date,
              team1Players,
              team2Players,
              score.team1Score,
              score.team2Score
            );

            updatedScores[groupName][matchIndex] = {
              ...score,
              isSubmitted: true
            };
            
            completedMatches++;
            setSubmitProgress((completedMatches / totalMatches) * 100);
            
          } catch (error) {
            console.error('Failed to submit match:', error);
            setSubmitError(`Failed to submit some results. Please try again.`);
            return;
          }
        }
      }

      await gameStorageService.updateGameScores(gameId, updatedScores);
      setGameData({
        ...gameData,
        scores: updatedScores
      });

      setShowProcessModal(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Game not found</h1>
        <button 
          className="btn btn-primary mt-4"
          onClick={handleBack}
        >
          Back to Game Day
        </button>
      </div>
    );
  }

  // Convert player IDs to full player objects
  const groups = Object.entries(gameData.groups).reduce((acc, [groupName, playerIds]) => {
    acc[groupName] = playerIds
      .map(id => players.find(p => p.id === id))
      .filter((player): player is NonNullable<typeof player> => player !== undefined)
      .sort((a, b) => a.playerRank - b.playerRank);
    return acc;
  }, {} as Record<string, typeof players>);

  // Initialize scores for a group if not exists
  const initializeGroupScores = (groupName: string) => {
    if (!gameData.scores[groupName]) {
      const matchCount = getMatchCombinations(groups[groupName].map(p => p.name)).length;
      const groupScores: GroupScores = {};
      
      for (let i = 0; i < matchCount; i++) {
        groupScores[i.toString()] = { team1Score: 0, team2Score: 0 };
      }
      
      setGameData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          scores: {
            ...prev.scores,
            [groupName]: groupScores
          }
        };
      });
    }
  };

  // Update score for a specific match
  const handleScoreChange = (
    groupName: string,
    matchIndex: number,
    team: 'team1Score' | 'team2Score',
    value: string
  ) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue)) return;

    setGameData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        scores: {
          ...prev.scores,
          [groupName]: {
            ...prev.scores?.[groupName],
            [matchIndex]: {
              ...prev.scores?.[groupName]?.[matchIndex],
              [team]: numValue
            }
          }
        }
      };
    });
  };

  const handleStart = async () => {
    if (!gameData || typeof gameId !== 'string') return;

    try {
      await gameStorageService.updateGameStarted(gameId, true);
      setIsGameStarted(true);
    } catch (error) {
      console.error('Failed to update game started state:', error);
      // Optionally show an error message to the user
    }
  };

  const handleMatchClick = (groupName: string, matchIndex: number, match: MatchCombination) => {
    if (!isGameStarted) return;
    
    // Check if match already has scores
    const existingScore = gameData?.scores?.[groupName]?.[matchIndex];
    if (existingScore && (existingScore.team1Score > 0 || existingScore.team2Score > 0)) {
      // Store the match details and show password modal
      setPendingMatch({
        groupName,
        matchIndex,
        team1: match.team1,
        team2: match.team2
      });
      setPasswordModalOpen(true);
    } else {
      // For new scores, no password needed
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
    const { totalGames, completedGames } = getGameStats(groups, gameData.scores || {});
    
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
                    const { totalGames, completedGames } = getGameStats(groups, gameData.scores || {});
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
                const matchScore = gameData?.scores?.[activeGroup]?.[idx];
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
                  min="0"
                  max={MAX_POINTS}
                  className="input input-bordered w-full text-center"
                  defaultValue={gameData.scores[selectedMatch.groupName]?.[selectedMatch.matchIndex]?.team1Score || 0}
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
                  min="0"
                  max={MAX_POINTS}
                  className="input input-bordered w-full text-center"
                  defaultValue={gameData.scores[selectedMatch.groupName]?.[selectedMatch.matchIndex]?.team2Score || 0}
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
            router.push('/admin/dashboard');
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