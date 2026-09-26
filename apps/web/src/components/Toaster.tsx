import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, ToastItem } from '../store/useToastStore';

const ToastMessageItem: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="has-text-success" style={{ flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={18} className="has-text-danger" style={{ flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={18} className="has-text-warning" style={{ flexShrink: 0 }} />;
      case 'info':
      default:
        return <Info size={18} className="has-text-info" style={{ flexShrink: 0 }} />;
    }
  };

  const getAccentBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--success, #10b981)';
      case 'error':
        return 'var(--danger, #ef4444)';
      case 'warning':
        return 'var(--warning, #f59e0b)';
      case 'info':
      default:
        return 'var(--primary, #2563eb)';
    }
  };

  return (
    <div
      className="toast-item"
      role="alert"
      style={{
        borderLeft: `4px solid ${getAccentBorder()}`
      }}
    >
      <div className="toast-icon-wrapper">{getIcon()}</div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toaster-container" aria-live="polite">
      {toasts.map((item) => (
        <ToastMessageItem key={item.id} toast={item} onDismiss={removeToast} />
      ))}
    </div>
  );
};
