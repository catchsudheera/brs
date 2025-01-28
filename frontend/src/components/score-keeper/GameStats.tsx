interface GameStatsProps {
  totalGames: number;
  completedGames: number;
}

export const GameStats = ({ totalGames, completedGames }: GameStatsProps) => (
  <div className="stats shadow">
    <div className="stat">
      <div className="stat-title">Total Matches</div>
      <div className="stat-value">{totalGames}</div>
    </div>
    <div className="stat">
      <div className="stat-title">Completed</div>
      <div className="stat-value text-success">{completedGames}</div>
    </div>
    <div className="stat">
      <div className="stat-title">Remaining</div>
      <div className="stat-value text-warning">{totalGames - completedGames}</div>
    </div>
  </div>
); 