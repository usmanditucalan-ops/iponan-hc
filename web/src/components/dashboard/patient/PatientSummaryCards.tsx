import { CalendarRange, Activity, FileText } from 'lucide-react';
import { useAppointments } from '../../../hooks/useAppointments';
import { useMedicalRecords } from '../../../hooks/useMedicalRecords';
import { useAuth } from '../../../context/AuthContext';

export const PatientSummaryCards = () => {
  const { user } = useAuth();
  const { appointments } = useAppointments();
  // We need to fetch medical records for the specific patient
  const { records } = useMedicalRecords();

  const VITALS_MARKER = '[NURSE_VITALS_RECORDED]';

  const pendingAppointmentsList = Array.isArray(appointments)
    ? appointments.filter(a => a.status === 'PENDING' || a.status === 'PRE-CONSULT' || a.status === 'CONFIRMED')
    : [];

  const pendingVisits = pendingAppointmentsList.length;

  const readyForConsultationCount = pendingAppointmentsList.filter(a =>
    a.status === 'CONFIRMED' && typeof a.notes === 'string' && a.notes.includes(VITALS_MARKER)
  ).length;
    
  // Assuming records is simply an array of records for the authenticated patient
  const totalRecords = Array.isArray(records) ? records.length : 0;

  const Card = ({ title, subtitle, count, icon: Icon, bgClass, iconBgClass, iconColorClass }: any) => (
    <div className={`p-6 rounded-[16px] shadow-sm flex items-center justify-between ${bgClass} border border-black/5 dark:border-white/5`}>
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{count}</span>
        <span className="text-[14px] font-semibold text-gray-900 dark:text-white mt-2">{title}</span>
        <span className="text-[12px] text-gray-600 dark:text-gray-400 mt-1">{subtitle}</span>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass}`}>
        <Icon className={iconColorClass} size={24} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <Card 
        count={Array.isArray(appointments) ? appointments.length : 0}
        title="My Appointments"
        subtitle="Total Appointments"
        icon={CalendarRange}
        bgClass="bg-white dark:bg-dark-surface-secondary"
        iconBgClass="bg-blue-100/80 dark:bg-blue-500/20"
        iconColorClass="text-blue-600 dark:text-blue-400"
      />
      <Card 
        count={pendingVisits}
        title="Pending Visits"
        subtitle={readyForConsultationCount > 0 ? "You are ready for Consultation!" : "Scheduled / Pending"}
        icon={Activity}
        bgClass={readyForConsultationCount > 0 ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-white dark:bg-dark-surface-secondary"}
        iconBgClass={readyForConsultationCount > 0 ? "bg-emerald-100/80 dark:bg-emerald-500/20" : "bg-orange-100/80 dark:bg-orange-500/20"}
        iconColorClass={readyForConsultationCount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}
      />
      <Card 
        count={totalRecords}
        title="Medical Records"
        subtitle="Available Records"
        icon={FileText}
        bgClass="bg-white dark:bg-dark-surface-secondary"
        iconBgClass="bg-emerald-100/80 dark:bg-emerald-500/20"
        iconColorClass="text-emerald-600 dark:text-emerald-400"
      />
    </div>
  );
};
