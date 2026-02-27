import React, { createContext, useState, useCallback } from 'react';
import { Toast, ConfirmationDialog, NotificationContextType } from '../types/notifications';

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationDialog[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss if duration is set
    if (toast.duration !== undefined) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfirmation = useCallback((dialog: Omit<ConfirmationDialog, 'id' | 'isLoading'>) => {
    return new Promise<boolean>(resolve => {
      const id = Date.now().toString();
      const newDialog: ConfirmationDialog = {
        ...dialog,
        id,
        isLoading: false,
        onConfirm: async () => {
          setConfirmations(prev =>
            prev.map(d => d.id === id ? { ...d, isLoading: true } : d)
          );
          try {
            await dialog.onConfirm();
            dismissConfirmation(id);
            resolve(true);
          } catch (error) {
            setConfirmations(prev =>
              prev.map(d => d.id === id ? { ...d, isLoading: false } : d)
            );
          }
        },
        onCancel: () => {
          dialog.onCancel?.();
          dismissConfirmation(id);
          resolve(false);
        }
      };
      setConfirmations(prev => [...prev, newDialog]);
    });
  }, []);

  const dismissConfirmation = useCallback((id: string) => {
    setConfirmations(prev => prev.filter(d => d.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showToast({
      type: 'success',
      title: title || 'Success',
      message,
      duration: 4000
    });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 5000
    });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast({
      type: 'info',
      title: title || 'Info',
      message,
      duration: 4000
    });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: 4000
    });
  }, [showToast]);

  const value: NotificationContextType = {
    toasts,
    confirmations,
    showToast,
    dismissToast,
    showConfirmation,
    dismissConfirmation,
    success,
    error,
    info,
    warning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
