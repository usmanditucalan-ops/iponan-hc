import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';

export const MiniCalendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <Card className="w-[320px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-text-primary dark:text-dark-text-primary">Calendar</h3>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary">February 2026</span>
          <div className="flex items-center gap-1">
            <button
              className="p-1 hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded transition-colors focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="p-1 hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded transition-colors focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 mb-6">
        {days.map(day => (
          <span key={day} className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark text-center uppercase">
            {day}
          </span>
        ))}
        {dates.map(date => {
          const isToday = date === 5;
          const hasApt = [3, 8, 12, 15, 18, 22, 25].includes(date);
          return (
            <div key={date} className="relative flex items-center justify-center">
              <button className={`w-8 h-8 rounded-md text-xs font-bold transition-all relative z-10 ${
                isToday ? 'bg-primary dark:bg-dark-primary text-white shadow-lg shadow-primary/30 dark:shadow-dark-primary/30' : 'text-text-primary dark:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary'
              }`}>
                {date}
              </button>
              {hasApt && !isToday && (
                <span className="absolute bottom-0 w-1 h-1 bg-primary dark:bg-dark-primary rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary dark:bg-dark-primary rounded-full"></span>
          <span className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase">Has appointments</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-primary dark:bg-dark-primary rounded-sm"></span>
          <span className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase">Today</span>
        </div>
      </div>
    </Card>
  );
};
