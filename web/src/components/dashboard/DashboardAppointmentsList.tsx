import { useMemo } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { differenceInYears } from 'date-fns';

export const DashboardAppointmentsList = () => {
  const { appointments } = useAppointments();

  const todayList = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    
    // In a real app we might filter isToday here, but useAppointments defaults to today
    return appointments.slice(0, 4).map(apt => {
      const user = apt.patient?.user;
      const firstName = user?.firstName || 'Unknown';
      const lastName = user?.lastName || 'Patient';
      const gender = apt.patient?.gender?.toLowerCase() || 'unknown';
      const dob = apt.patient?.dateOfBirth;
      const age = dob ? differenceInYears(new Date(), new Date(dob)) : '?';
      const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes('[NURSE_VITALS_RECORDED]');
      let statusLabel = 'Waiting';
      let statusClass = 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      if (apt.status === 'CONFIRMED' && hasVitalsMarker) {
         statusLabel = 'Ready';
         statusClass = 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      } else if (apt.status === 'COMPLETED') {
         statusLabel = 'Completed';
         statusClass = 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      } else if (apt.status === 'PENDING') {
         statusLabel = 'Pending';
         statusClass = 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      } else if (apt.status === 'CANCELLED') {
         statusLabel = 'Cancelled';
         statusClass = 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      } else if (apt.status === 'RESCHEDULED') {
         statusLabel = 'Rescheduled';
         statusClass = 'text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      }

      let condition = apt.reason || 'General Consultation';
      if (condition.length > 25) condition = condition.substring(0, 22) + '...';

      return {
        id: apt.id,
        name: `${firstName} ${lastName}`,
        condition,
        gender,
        age: `${age}y`,
        initial: firstName.charAt(0).toUpperCase() || 'P',
        statusLabel,
        statusClass
      };
    });
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-dark-surface-secondary border-2 border-border/50 dark:border-dark-border rounded-[17px] p-6 shadow-sm flex flex-col w-full h-full min-h-[250px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Today's Appointment</h3>
      </div>

      <div className="flex flex-col gap-4">
        {todayList.length === 0 ? (
          <div className="text-sm text-center text-text-muted dark:text-dark-text-muted-dark py-4">No appointments today</div>
        ) : (
          todayList.map(apt => (
            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                  {apt.initial}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{apt.name}</h4>
                  <p className="text-[10px] text-text-muted dark:text-dark-text-muted-dark truncate">{apt.condition}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:w-1/2 sm:justify-end gap-4 text-xs font-semibold">
                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${apt.statusClass}`}>
                  {apt.statusLabel}
                </span>
                <span className="capitalize w-12 text-center text-text-secondary dark:text-dark-text-secondary">{apt.gender}</span>
                <span className="w-8 text-center text-text-secondary dark:text-dark-text-secondary">{apt.age}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
