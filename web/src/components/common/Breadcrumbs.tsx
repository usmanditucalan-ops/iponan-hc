import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center text-sm text-text-muted dark:text-dark-text-muted-dark mb-2 ${className}`} aria-label="Breadcrumb">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-primary dark:hover:text-dark-primary transition-colors"
      >
        <Home size={16} />
        <span className="sr-only">Dashboard</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={16} className="mx-2 text-text-muted/50 dark:text-dark-text-muted-dark/50" />
          {item.path ? (
            <Link 
              to={item.path}
              className="hover:text-primary dark:hover:text-dark-primary transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-text-primary dark:text-dark-text-primary">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
