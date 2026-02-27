import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { BarChart2, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAppointments } from '../../hooks/useAppointments';

interface MetricBucket {
  label: string;
  value: number;
  color: string;
}

const Y_TICKS = 4;

export const PatientStatisticsChart = () => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { appointments, loading: aptsLoading } = useAppointments();

  const completedToday = useMemo(() => {
    if (!Array.isArray(appointments)) return 0;
    return appointments.filter(a => a.status === 'COMPLETED').length;
  }, [appointments]);

  const loading = statsLoading || aptsLoading;

  const data: MetricBucket[] = [
    { label: 'Patients', value: stats?.totalPatients || 0, color: '#6366f1' }, // Indigo
    { label: 'Appointments', value: stats?.appointmentsToday || 0, color: '#f59e0b' }, // Amber
    { label: 'Completed', value: completedToday, color: '#10b981' }, // Emerald
    { label: 'Records', value: stats?.totalRecords || 0, color: '#ef4444' }, // Rose
  ];

  const maxValue = useMemo(() => {
    if (!data.length) return 100;
    const max = Math.max(...data.map((d) => d.value));
    return max > 0 ? max : 100;
  }, [data]);

  // Provide some top headroom
  const chartMax = Math.ceil(maxValue * 1.15);

  return (
    <Card className="p-5 md:p-6 border border-border dark:border-dark-border shadow-sm flex-1 h-full flex flex-col bg-white dark:bg-dark-surface-secondary">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h3 className="text-[17px] font-bold text-text-primary dark:text-dark-text-primary tracking-tight">
          System Overview Distribution
        </h3>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-primary dark:text-dark-primary shadow-sm hover:bg-surface-secondary transition-colors shrink-0">
          <BarChart2 size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-end min-h-[300px]">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-primary/50 dark:text-dark-primary/50">
             <Loader2 size={32} className="animate-spin" />
          </div>
        ) : (
          <div className="relative w-full h-[300px] flex items-end">
             {/* Y-Axis Guidelines */}
             <div className="absolute inset-0 flex flex-col justify-between z-0 pb-7">
               {Array.from({ length: Y_TICKS + 1 }).map((_, i) => {
                 // Calculate value for this tick
                 const value = Math.round(chartMax - (i / Y_TICKS) * chartMax);
                 return (
                    <div key={i} className="flex items-center w-full relative">
                       <span className="w-8 text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark text-right pr-3 -translate-y-1/2 absolute left-0">
                         {value}
                       </span>
                       <div className="h-[1px] w-full ml-10 bg-border/40 dark:bg-dark-border/40" />
                    </div>
                 );
               })}
             </div>

             {/* Bar Chart Bars */}
             <div className="relative z-10 w-full h-full flex items-end justify-between ml-10 pb-7 px-4 sm:px-12">
                {data.map((bucket, index) => {
                  const heightPercent = `${(bucket.value / chartMax) * 100}%`;
                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full w-[16%] max-w-[64px] group">
                       <div className="relative w-full flex flex-col items-center justify-end h-full">
                          {/* Value Tag Above Bar */}
                          <span 
                            className="absolute -top-6 text-[12px] font-black tracking-tight"
                            style={{ color: bucket.color }}
                          >
                            {bucket.value}
                          </span>
                          
                          {/* The Bar Itself */}
                          <div 
                            className="w-full rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110"
                            style={{ 
                              height: heightPercent, 
                              backgroundColor: bucket.color,
                              minHeight: '4px' 
                            }}
                          >
                             {/* Overlay to give subtle depth, matching reference */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-lg" />
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>

             {/* X-Axis Labels */}
             <div className="absolute bottom-0 left-0 right-0 ml-10 px-4 sm:px-12 flex justify-between">
                {data.map((bucket, index) => (
                  <div key={index} className="w-[16%] max-w-[64px] text-center">
                    <span className="text-[10px] font-bold tracking-widest text-text-muted dark:text-dark-text-muted-dark uppercase truncate block w-full">
                      {bucket.label}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </Card>
  );
};
