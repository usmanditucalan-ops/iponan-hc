import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType, NotificationType } from '../../types/notifications';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

const getToastStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-primary-light dark:bg-dark-primary/20',
        border: 'border-primary/20 dark:border-dark-primary/30',
        icon: CheckCircle2,
        iconColor: 'text-primary dark:text-dark-primary',
        title: 'text-primary dark:text-dark-primary',
        message: 'text-primary/80 dark:text-dark-primary/80'
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-200 dark:border-red-900/50',
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-400',
        message: 'text-red-800 dark:text-red-300'
      };
    case 'warning':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-900/50',
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-900 dark:text-amber-400',
        message: 'text-amber-800 dark:text-amber-300'
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-900/50',
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-400',
        message: 'text-blue-800 dark:text-blue-300'
      };
  }
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const styles = getToastStyles(toast.type);
  const IconComponent = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-md p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-4 duration-300 flex gap-4 items-start max-w-sm`}
      role="alert"
      aria-live="polite"
    >
      <IconComponent size={20} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h3 className={`font-bold text-sm ${styles.title} mb-1`}>
            {toast.title}
          </h3>
        )}
        <p className={`text-sm ${styles.message} break-words`}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={`text-xs font-bold mt-2 ${
              toast.type === 'error' ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' :
              toast.type === 'warning' ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300' :
              toast.type === 'success' ? 'text-primary dark:text-dark-primary hover:text-primary-hover dark:hover:text-dark-primary' :
              'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
            } underline`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className={`flex-shrink-0 ${
          toast.type === 'error' ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' :
          toast.type === 'warning' ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300' :
          toast.type === 'success' ? 'text-primary dark:text-dark-primary hover:text-primary-hover dark:hover:text-dark-primary' :
          'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
        } transition-colors`}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};
