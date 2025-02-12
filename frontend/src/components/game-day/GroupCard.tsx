import { Player } from '@/types/player';
import { capitalizeFirstLetter } from '@/utils/string';

interface GroupCardProps {
  groupName: string;
  players: Player[];
}

export const GroupCard = ({ groupName, players }: GroupCardProps) => (
  <div className="p-4">
    <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-base-200">
      {groupName}
      <span className="text-sm font-normal text-gray-500 ml-2">
        ({players.length} players)
      </span>
    </h2>
    <div className="space-y-2">
      {players.map((player, index) => (
        <div 
          key={player.id}
          className={`flex items-center justify-between py-1 ${
            index !== players.length - 1 ? 'border-b border-base-200/50' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {capitalizeFirstLetter(player.name)}
            </span>
            <span className="text-xs text-gray-500">
              (#{player.playerRank ? player.playerRank : 'N/A'})
            </span>
          </div>
          <div className="text-xs font-medium text-gray-500">
            {player.rankScore ? player.rankScore.toFixed(1) : 'N/A'}
          </div>
        </div>
      ))}
    </div>
  </div>
); 