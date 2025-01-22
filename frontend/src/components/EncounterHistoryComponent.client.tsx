import React, { useState, useMemo } from 'react';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { capitalizeFirstLetter } from '@/utils/string';

interface Encounter {
  encounterDate: string;
  encounterId: number;
  encounterScore: number;
  opponentTeam: { playerName: string; playerId: number }[];
  opponentTeamPoints: number;
  playerTeam: { playerName: string; playerId: number }[];
  playerTeamPoints: number;
}

const EncounterHistoryComponent = () => {
  const { players } = usePlayerContext();
  const [teamA1, setTeamA1] = useState<number>(0);
  const [teamA2, setTeamA2] = useState<number>(0);
  const [teamB1, setTeamB1] = useState<number>(0);
  const [teamB2, setTeamB2] = useState<number>(0);
  const [result, setResult] = useState<Encounter[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sortedPlayers = useMemo(() => 
    [...players].sort((a, b) => a.name.localeCompare(b.name)),
    [players]
  );

  // Validation for duplicate players
  const getValidationError = () => {
    const selectedPlayers = [teamA1, teamA2, teamB1, teamB2].filter(id => id !== 0);
    const uniquePlayers = new Set(selectedPlayers);
    
    if (selectedPlayers.length !== uniquePlayers.size) {
      return "A player can't be selected multiple times";
    }
    
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = getValidationError();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://brs.aragorn-media-server.duckdns.org/encounters-for-players?teamAp1=${teamA1}&teamAp2=${teamA2}&teamBp1=${teamB1}&teamBp2=${teamB2}`
      );
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Error fetching encounters:', error);
      // Optionally add error handling here
    } finally {
      setIsLoading(false);
    }
  };

  const validationError = getValidationError();

  const renderResults = (encounters: Encounter[]) => {
    if (!encounters || encounters.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          No matches found for these players
        </div>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Team 1</th>
                <th className="text-center">Score</th>
                <th className="text-left">Team 2</th>
                <th className="text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {encounters.map((encounter) => (
                <tr 
                  key={encounter.encounterId}
                  className="hover:bg-base-200 transition-colors duration-150"
                >
                  <td className="whitespace-nowrap">
                    {new Date(encounter.encounterDate).toLocaleDateString()}
                  </td>
                  <td>
                    {encounter.playerTeam
                      .map(player => capitalizeFirstLetter(player.playerName))
                      .join(', ')}
                  </td>
                  <td className="text-center whitespace-nowrap">
                    {encounter.playerTeamPoints} - {encounter.opponentTeamPoints}
                  </td>
                  <td>
                    {encounter.opponentTeam
                      .map(player => capitalizeFirstLetter(player.playerName))
                      .join(', ')}
                  </td>
                  <td className="text-center">
                    <span 
                      className={`font-medium ${
                        encounter.encounterScore > 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {encounter.encounterScore > 0 ? '+' : ''}
                      {encounter.encounterScore.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {encounters.map((encounter) => (
            <div 
              key={encounter.encounterId}
              className="bg-base-200 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {new Date(encounter.encounterDate).toLocaleDateString()}
                </span>
                <span 
                  className={`font-medium ${
                    encounter.encounterScore > 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {encounter.encounterScore > 0 ? '+' : ''}
                  {encounter.encounterScore.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="col-span-1">
                  <div className="font-medium">
                    {encounter.playerTeam
                      .map(player => capitalizeFirstLetter(player.playerName))
                      .join(', ')}
                  </div>
                </div>
                <div className="col-span-1 text-center font-bold">
                  {encounter.playerTeamPoints} - {encounter.opponentTeamPoints}
                </div>
                <div className="col-span-1 text-right">
                  <div className="font-medium">
                    {encounter.opponentTeam
                      .map(player => capitalizeFirstLetter(player.playerName))
                      .join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className='container mx-auto p-4'>
      {/* Title Section */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Find Encounters
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Select players to find their matches together
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 */}
          <div className="bg-base-200 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-center">Team 1</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Player 1 <span className="text-error">*</span>
                </label>
                <select
                  value={teamA1}
                  onChange={(e) => setTeamA1(Number(e.target.value))}
                  className="select select-bordered w-full"
                  required
                >
                  <option value={0}>Select player...</option>
                  {sortedPlayers.map((player) => (
                    <option key={`a1-${player.id}`} value={player.id}>
                      {capitalizeFirstLetter(player.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Player 2</label>
                <select
                  value={teamA2}
                  onChange={(e) => setTeamA2(Number(e.target.value))}
                  className="select select-bordered w-full"
                >
                  <option value={0}>Select player...</option>
                  {sortedPlayers.map((player) => (
                    <option key={`a2-${player.id}`} value={player.id}>
                      {capitalizeFirstLetter(player.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-base-200 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-center">Team 2</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Player 1</label>
                <select
                  value={teamB1}
                  onChange={(e) => setTeamB1(Number(e.target.value))}
                  className="select select-bordered w-full"
                >
                  <option value={0}>Select player...</option>
                  {sortedPlayers.map((player) => (
                    <option key={`b1-${player.id}`} value={player.id}>
                      {capitalizeFirstLetter(player.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Player 2</label>
                <select
                  value={teamB2}
                  onChange={(e) => setTeamB2(Number(e.target.value))}
                  className="select select-bordered w-full"
                >
                  <option value={0}>Select player...</option>
                  {sortedPlayers.map((player) => (
                    <option key={`b2-${player.id}`} value={player.id}>
                      {capitalizeFirstLetter(player.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="mt-4 text-center text-error text-sm">
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="btn btn-primary px-8"
            disabled={!teamA1 || !!validationError || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                <span className="ml-2">Finding...</span>
              </>
            ) : (
              'Find Matches'
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div className="mt-8">
          <div className="bg-base-100 rounded-lg shadow-lg">
            <div className="p-4 border-b border-base-200">
              <h2 className="text-xl font-semibold">Match Results</h2>
            </div>
            {renderResults(result)}
          </div>
        </div>
      )}
    </div>
  );
};

export default EncounterHistoryComponent;
