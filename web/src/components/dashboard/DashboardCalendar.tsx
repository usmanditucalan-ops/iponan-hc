import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardCalendarProps {
  className?: string;
}

export const DashboardCalendar = ({ className = '' }: DashboardCalendarProps) => {
  // Hardcoded to February to exactly match the reference layout visually
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Generating a grid of 5 rows, 7 columns
  const grid = [
    [ { d: 26, fade: true }, { d: 27, fade: true }, { d: 28, fade: true }, { d: 29, fade: true }, { d: 30, fade: true }, { d: 31, fade: true }, { d: 1, fade: false } ],
    [ { d: 2, fade: false }, { d: 3, fade: false }, { d: 4, fade: false }, { d: 5, fade: false }, { d: 6, fade: false }, { d: 7, fade: false }, { d: 8, fade: false } ],
    [ { d: 9, fade: false }, { d: 10, fade: false }, { d: 11, fade: false }, { d: 12, fade: false }, { d: 13, fade: false }, { d: 14, fade: false }, { d: 15, fade: false, highlight: true } ],
    [ { d: 16, fade: false }, { d: 17, fade: false }, { d: 18, fade: false }, { d: 19, fade: false }, { d: 20, fade: false }, { d: 21, fade: false }, { d: 22, fade: false } ],
    [ { d: 23, fade: false }, { d: 24, fade: false }, { d: 25, fade: false }, { d: 26, fade: false }, { d: 27, fade: false, highlight: true }, { d: 28, fade: false }, { d: 1, fade: true } ]
  ];

  return (
    <div className={`bg-white dark:bg-dark-surface-secondary border-2 border-border/50 dark:border-dark-border rounded-[17px] p-5 shadow-sm flex flex-col w-full overflow-hidden ${className || 'min-h-[350px] h-full'}`}>
      <div className="flex justify-between items-center mb-4 px-1">
        <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-black dark:text-white font-medium text-[14px]">February</span>
        <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-gray-400 dark:text-gray-500 text-[9px] font-bold tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 flex-1 w-full justify-between">
        {grid.map((row, rIndex) => (
          <div key={rIndex} className="grid grid-cols-7 gap-x-1">
            {row.map((cell, cIndex) => (
              <div key={cIndex} className="flex justify-center items-center">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-medium transition-all ${
                  cell.highlight 
                    ? 'bg-[#6a5acd] text-white shadow-md' 
                    : cell.fade 
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}>
                  {cell.d}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
