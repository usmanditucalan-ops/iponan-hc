import { useEffect, useState } from 'react';
import { Clock, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string; // Patient ID
  patientName: string;
  action: string;
  timestamp: number;
}

interface RecentActivityProps {
  limit?: number;
  compact?: boolean;
}

export const RecentActivity = ({ limit = 5, compact = false }: RecentActivityProps) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadActivity = () => {
      try {
        const stored = localStorage.getItem('recentActivity');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Sort by timestamp desc and take requested limit
          setActivities(parsed.sort((a: ActivityItem, b: ActivityItem) => b.timestamp - a.timestamp).slice(0, limit));
        }
      } catch (e) {
        console.error('Failed to load recent activity', e);
      }
    };

    loadActivity();
    // Listen for storage events (in case updated in another tab)
    window.addEventListener('storage', loadActivity);
    // Custom event for same-tab updates
    window.addEventListener('recentActivityUpdated', loadActivity);

    return () => {
      window.removeEventListener('storage', loadActivity);
      window.removeEventListener('recentActivityUpdated', loadActivity);
    };
  }, [limit]);

  if (activities.length === 0) return null;

  return (
    <Card className={`bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border shadow-sm dark:shadow-md h-fit w-full`}>
      <div className={`flex items-center gap-2 mb-2 text-primary dark:text-dark-primary ${compact ? 'px-3 pt-3' : 'px-4 pt-4'}`}>
        <Activity size={compact ? 14 : 16} />
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-text-primary dark:text-dark-text-primary`}>Recent Activity</h3>
      </div>
      
      <div className={`space-y-1 ${compact ? 'px-2 pb-2' : 'px-2 pb-2'}`}>
        {activities.map((item) => (
          <div 
            key={`${item.id}-${item.timestamp}`}
            className="group flex items-center justify-between p-2 rounded hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary transition-all cursor-pointer border border-transparent hover:border-border dark:hover:border-dark-border"
            onClick={() => navigate(`/medical-records?patientId=${item.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary flex items-center justify-center font-bold ${compact ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'}`}>
                {item.patientName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold text-text-primary dark:text-dark-text-primary group-hover:text-primary dark:group-hover:text-dark-primary transition-colors truncate max-w-[120px]`}>
                  {item.patientName}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
                  <span className="font-medium truncate max-w-[80px]">{item.action}</span>
                  <span className="text-text-muted/50 dark:text-dark-text-muted-dark/50">•</span>
                  <span className="text-text-muted dark:text-dark-text-muted-dark flex items-center gap-0.5">
                    <Clock size={8} />
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            {!compact && <ChevronRight size={14} className="text-text-muted/50 dark:text-dark-text-muted-dark/50 group-hover:text-primary dark:group-hover:text-dark-primary transition-colors flex-shrink-0" />}
          </div>
        ))}
      </div>
    </Card>
  );
};
