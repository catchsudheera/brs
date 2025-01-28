interface ActionPanelProps {
  selectedCount: number;
  maxPlayers: number;
  isEditing: boolean;
  validationMessage: string;
  isValid: boolean;
  onCreateGame: () => void;
  isMobile?: boolean;
}

export const ActionPanel = ({
  selectedCount,
  maxPlayers,
  isEditing,
  validationMessage,
  isValid,
  onCreateGame,
  isMobile = false
}: ActionPanelProps) => {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 shadow-lg p-4 md:hidden border-t border-base-200">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              Selected: {selectedCount}/{maxPlayers}
            </div>
            {selectedCount > 0 && !isValid && (
              <div className="text-sm text-red-500">
                {validationMessage}
              </div>
            )}
          </div>
          <button
            className={`btn w-full ${
              !isValid
                ? 'btn-disabled bg-gray-300 cursor-not-allowed' 
                : 'btn-primary'
            }`}
            disabled={!isValid}
            title={validationMessage}
            onClick={onCreateGame}
          >
            {isEditing ? 'Update Game Day' : 'Create Game Day'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:block mt-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Selected Players: {selectedCount}/{maxPlayers}
        </div>
        <button
          className={`btn ${
            !isValid
              ? 'btn-disabled bg-gray-300 cursor-not-allowed' 
              : 'btn-primary'
          }`}
          disabled={!isValid}
          title={validationMessage}
          onClick={onCreateGame}
        >
          {isEditing ? 'Update Game Day' : 'Create Game Day'}
        </button>
      </div>
      {selectedCount > 0 && !isValid && (
        <p className="text-sm text-red-500 mt-2">
          {validationMessage}
        </p>
      )}
    </div>
  );
}; 