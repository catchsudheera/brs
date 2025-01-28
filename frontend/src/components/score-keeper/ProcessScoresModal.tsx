interface ProcessScoresModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  onProcess: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const ProcessScoresModal = ({
  isOpen,
  isProcessing,
  error,
  success,
  onProcess,
  onRetry,
  onClose
}: ProcessScoresModalProps) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {error ? 'Processing Error' : success ? 'Processing Complete' : 'Results Submitted'}
        </h3>
        
        {error ? (
          <>
            <div className="alert alert-error mb-4">
              <p>{error}</p>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-outline"
                onClick={onClose}
                type="button"
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={onRetry}
                type="button"
              >
                Retry
              </button>
            </div>
          </>
        ) : success ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All scores have been processed successfully.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={onClose}
                type="button"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All results have been submitted. Would you like to process the scores now?
            </p>
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading loading-spinner"></div>
                <span>Processing scores...</span>
              </div>
            ) : (
              <div className="modal-action">
                <button 
                  className="btn btn-outline"
                  onClick={onClose}
                  type="button"
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={onProcess}
                  type="button"
                >
                  Process Scores
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}; 