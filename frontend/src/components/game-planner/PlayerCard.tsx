import { Player } from '@/types/player';
import { capitalizeFirstLetter } from '@/utils/string';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export const PlayerCard = ({ player, isSelected, onToggle }: PlayerCardProps) => (
  <div
    className={`p-4 rounded-lg border transition-colors duration-150 cursor-pointer ${
      isSelected
        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
        : 'border-gray-200 hover:border-emerald-500'
    }`}
    onClick={() => onToggle(player.id)}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">
          {capitalizeFirstLetter(player.name)}
        </div>
        <div className="text-sm text-gray-500">
          Rank: #{player.playerRank}
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        isSelected
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-gray-300'
      }`}>
        {isSelected && (
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  </div>
); 