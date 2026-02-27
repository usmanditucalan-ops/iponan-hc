import { useMemo } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { useNavigate } from 'react-router-dom';

export const RecentPatientsList = () => {
  const { appointments } = useAppointments();
  const navigate = useNavigate();

  const recentList = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    // Reverse sort or just take first few depending on how the endpoint works
    // Filter to ensure distinct patients
    const distinctPatients = new Map();
    for (const apt of appointments) {
      if (apt.patientId && !distinctPatients.has(apt.patientId)) {
        distinctPatients.set(apt.patientId, apt);
      }
    }
    
    return Array.from(distinctPatients.values()).slice(0, 3).map(apt => {
      const user = apt.patient?.user;
      const firstName = user?.firstName || 'Unknown';
      const lastName = user?.lastName || 'Patient';
      
      let condition = apt.reason || 'General Consultation';
      if (condition.length > 25) condition = condition.substring(0, 22) + '...';

      return {
        id: apt.id,
        name: `${firstName} ${lastName}`,
        condition,
        initial: firstName.charAt(0).toUpperCase() || 'P'
      };
    });
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-dark-surface-secondary border-2 border-border/50 dark:border-dark-border rounded-[24px] p-6 shadow-sm flex flex-col w-full h-full min-h-[250px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-bold text-text-primary dark:text-dark-text-primary">Recent Patients</h3>
      </div>

      <div className="flex flex-col gap-5">
        {recentList.length === 0 ? (
          <div className="text-sm text-center text-text-muted dark:text-dark-text-muted-dark py-4">No recent patients</div>
        ) : (
          recentList.map(item => (
            <div key={item.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                  {item.initial}
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{item.name}</h4>
                  <p className="text-[10px] text-text-muted dark:text-dark-text-muted-dark truncate">{item.condition}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
