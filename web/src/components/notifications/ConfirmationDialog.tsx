import React from 'react';
import { X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ConfirmationDialog } from '../../types/notifications';

interface ConfirmationDialogProps {
  dialog: ConfirmationDialog;
}

export const ConfirmationDialogComponent: React.FC<ConfirmationDialogProps> = ({ dialog }) => {
  const isDangerous = dialog.isDangerous || false;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
      <div
        className="bg-white dark:bg-dark-surface-secondary w-full max-w-md rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
      >
        {/* Header */}
        <div className={`p-6 border-b border-border dark:border-dark-border flex items-center justify-between ${
          isDangerous ? 'bg-red-50 dark:bg-red-950/30' : 'bg-primary/5 dark:bg-dark-primary/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDangerous ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary'
            }`}>
              {isDangerous ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </div>
            <h2
              id="confirmation-dialog-title"
              className={`text-lg font-bold ${
                isDangerous ? 'text-red-900 dark:text-red-400' : 'text-text-primary dark:text-dark-text-primary'
              }`}
            >
              {dialog.title}
            </h2>
          </div>
          <button
            className="p-2 hover:bg-white/50 dark:hover:bg-dark-surface-tertiary rounded-xl transition-colors text-text-muted dark:text-dark-text-muted-dark focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 text-center space-y-6">
          <p className="text-text-secondary dark:text-dark-text-secondary font-medium">
            {dialog.message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={dialog.onCancel}
              disabled={dialog.isLoading}
              className="px-6 py-3 text-text-secondary dark:text-dark-text-secondary font-bold text-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none"
            >
              {dialog.cancelLabel || 'Cancel'}
            </button>
            <button
              onClick={dialog.onConfirm}
              disabled={dialog.isLoading}
              className={`px-8 py-3 text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none ${
                isDangerous
                  ? 'bg-red-600 dark:bg-red-600 shadow-lg shadow-red-600/30 dark:shadow-red-600/20 focus:ring-red-600'
                  : 'bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30 dark:shadow-dark-primary/30 focus:ring-primary dark:focus:ring-dark-primary'
              }`}
            >
              {dialog.isLoading && <Loader2 className="animate-spin" size={16} />}
              {dialog.isLoading ? 'Processing...' : (dialog.confirmLabel || 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
