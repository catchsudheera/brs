interface ScoreInputProps {
  team1Score: number;
  team2Score: number;
  onScoreChange: (team1: number, team2: number) => void;
  isSubmitted?: boolean;
}

export const ScoreInput = ({
  team1Score,
  team2Score,
  onScoreChange,
  isSubmitted = false
}: ScoreInputProps) => (
  <div className="flex items-center gap-4">
    <input
      type="number"
      className="input input-bordered w-20"
      value={team1Score || ''}
      onChange={(e) => {
        const newScore = parseInt(e.target.value) || 0;
        onScoreChange(newScore, team2Score);
      }}
      min={0}
      max={30}
      disabled={isSubmitted}
    />
    <span className="text-lg font-bold">-</span>
    <input
      type="number"
      className="input input-bordered w-20"
      value={team2Score || ''}
      onChange={(e) => {
        const newScore = parseInt(e.target.value) || 0;
        onScoreChange(team1Score, newScore);
      }}
      min={0}
      max={30}
      disabled={isSubmitted}
    />
  </div>
); 