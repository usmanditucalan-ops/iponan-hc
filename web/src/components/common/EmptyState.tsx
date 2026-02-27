import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-2xl flex items-center justify-center mb-4 text-primary dark:text-dark-primary/60">
        <Icon size={32} className="opacity-80" />
      </div>
      <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-muted dark:text-dark-text-muted-dark max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary hover:bg-primary/5 dark:hover:bg-dark-primary/10 text-primary dark:text-dark-primary border border-primary/20 dark:border-dark-primary/20 rounded-xl font-bold text-sm transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
