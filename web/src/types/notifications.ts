export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // ms, undefined = no auto-close
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean; // red color for delete/dangerous actions
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface NotificationContextType {
  // State
  toasts: Toast[];
  confirmations: ConfirmationDialog[];

  // Toast notifications
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Confirmation dialogs
  showConfirmation: (dialog: Omit<ConfirmationDialog, 'id'>) => Promise<boolean>;
  dismissConfirmation: (id: string) => void;

  // Helper methods
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}
