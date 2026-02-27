import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("bg-white dark:bg-dark-surface-secondary rounded-lg p-4 border border-border dark:border-dark-border shadow-sm dark:shadow-md", className)}
      {...props}
    >
      {children}
    </div>
  );
};
