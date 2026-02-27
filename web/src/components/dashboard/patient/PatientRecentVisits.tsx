import { format, parseISO, isAfter } from 'date-fns';
import { Calendar, History } from 'lucide-react';
import { useAppointments } from '../../../hooks/useAppointments';

export const PatientRecentVisits = () => {
  const { appointments } = useAppointments();

  // Find past appointments (status COMPLETED) or appointments strictly in the past
  const pastApts = Array.isArray(appointments)
    ? appointments
        .filter(a => a.status === 'COMPLETED' || (a.date && isAfter(new Date(), parseISO(a.date))))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5) // Show top 5 recent visits
    : [];

  if (pastApts.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface-secondary rounded-[16px] shadow-sm border border-gray-100 dark:border-dark-border p-6 flex flex-col w-full h-full">
        <h2 className="text-[18px] font-semibold text-gray-900 dark:text-dark-text-primary leading-tight mb-6">Recent Visits</h2>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[150px]">
           <div className="w-12 h-12 bg-gray-50 dark:bg-dark-surface-tertiary rounded-full flex items-center justify-center mb-3">
             <History className="text-gray-400 dark:text-dark-text-muted-dark" size={24} />
           </div>
           <p className="text-gray-500 dark:text-dark-text-muted mt-2 text-sm">No recent consultation history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface-secondary rounded-[16px] shadow-sm border border-gray-100 dark:border-dark-border p-6 flex flex-col w-full md:h-[360px] h-auto overflow-hidden">
      <h2 className="text-[18px] font-semibold text-gray-900 dark:text-dark-text-primary leading-tight mb-4 shrink-0">Recent Visits</h2>
      
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-0 border border-gray-100 dark:border-dark-border rounded-xl">
        {pastApts.map((apt, index) => {
          const displayDate = apt.date ? format(parseISO(apt.date), 'MMM dd, yyyy') : 'Unknown Date';
          const reason = apt.reason?.split(',')[0] || 'General';
          
          return (
            <div 
              key={apt.id} 
              className={`flex items-center justify-between p-4 bg-white dark:bg-dark-surface-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-tertiary transition-colors ${
                index !== pastApts.length - 1 ? 'border-b border-gray-100 dark:border-dark-border' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-surface-tertiary flex items-center justify-center">
                  <Calendar size={18} className="text-gray-500 dark:text-dark-text-muted" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{displayDate}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{reason}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-surface-tertiary px-2.5 py-1 rounded-full border border-gray-200 dark:border-dark-border uppercase tracking-wide">
                  {apt.status}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{apt.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
