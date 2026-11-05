import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircle2 size={18} strokeWidth={2.2} color="var(--success)" />,
    error: <AlertOctagon size={18} strokeWidth={2.2} color="var(--danger)" />,
    warning: <AlertTriangle size={18} strokeWidth={2.2} color="var(--warning)" />,
    info: <Info size={18} strokeWidth={2.2} color="var(--gold-accent)" />
  };

  return (
    <div className={`toast-item toast-${type}`}>
      <span className="toast-icon">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          <X size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
