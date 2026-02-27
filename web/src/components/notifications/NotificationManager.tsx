import React, { useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { Toast as ToastType, ConfirmationDialog } from '../../types/notifications';
import { Toast } from './Toast';
import { ConfirmationDialogComponent } from './ConfirmationDialog';

export const NotificationManager: React.FC = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    return null;
  }

  const { toasts, confirmations, dismissToast } = context;

  return (
    <>
      {/* Toast Container - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-[220] space-y-3 pointer-events-none">
        {toasts.map((toast: ToastType) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          </div>
        ))}
      </div>

      {/* Confirmation Dialog - Center */}
      {confirmations.map((dialog: ConfirmationDialog) => (
        <div key={dialog.id}>
          <ConfirmationDialogComponent dialog={dialog} />
        </div>
      ))}
    </>
  );
};
