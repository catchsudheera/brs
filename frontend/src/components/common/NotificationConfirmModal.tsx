interface NotificationConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title: string;
  message: string;
}

export const NotificationConfirmModal = ({
  isOpen,
  onConfirm,
  onClose,
  title,
  message
}: NotificationConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Send Notification</h3>
        <div className="space-y-4">
          <div className="p-4 bg-base-200 rounded-lg">
            <p className="font-semibold">{title}</p>
            <p className="text-sm mt-2 text-base-content/70">{message}</p>
          </div>
          <p className="text-sm text-base-content/70">
            This notification will be sent to all subscribed users.
          </p>
        </div>
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Send Notification
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}; 