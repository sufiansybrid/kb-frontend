import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title = 'Confirm deletion', message, confirmLabel = 'Delete', loading,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-md"
      title=""
      footer={
        <>
          <button className="btn-secondary btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-danger btn" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
