interface NavigationButtonsProps {
  onBack: () => void;
  onContinue: () => void;
}

export const NavigationButtons = ({ onBack, onContinue }: NavigationButtonsProps) => (
  <div className="flex justify-between mt-6">
    <button 
      className="btn btn-outline"
      onClick={onBack}
    >
      Back to Selection
    </button>
    <button 
      className="btn btn-primary"
      onClick={onContinue}
    >
      Continue to Score Keeper
    </button>
  </div>
); 