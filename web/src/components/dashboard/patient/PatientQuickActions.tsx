import { useNavigate } from 'react-router-dom';
import { CalendarPlus, FileText, UserCircle2 } from 'lucide-react';

export const PatientQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-dark-surface-secondary rounded-[16px] shadow-sm border border-gray-100 dark:border-dark-border p-6 flex flex-col w-full md:h-[360px] h-auto overflow-hidden">
      <h3 className="text-[18px] font-semibold text-gray-900 dark:text-dark-text-primary mb-5 shrink-0">Quick Actions</h3>
      
      <div className="flex flex-col gap-4">
        {/* Primary Action */}
        <button
          onClick={() => navigate('/appointments')}
          className="w-full h-[84px] rounded-[16px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white flex gap-4 items-center px-5 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <CalendarPlus size={24} className="text-white" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-base font-bold leading-tight">Book Appointment</span>
            <span className="text-[12px] text-blue-100 mt-0.5">Schedule a new consultation</span>
          </div>
        </button>

        <div className="flex flex-col gap-3 mt-4">
          {/* Secondary Actions */}
          <button
            onClick={() => navigate('/medical-records')}
            className="w-full py-4 px-5 rounded-[12px] border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-tertiary/50 hover:bg-gray-100 dark:hover:bg-dark-surface-tertiary text-gray-700 dark:text-dark-text-secondary flex items-center justify-between transition-colors group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-500 dark:text-dark-text-muted group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-semibold">View My Records</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-full py-4 px-5 rounded-[12px] border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-tertiary/50 hover:bg-gray-100 dark:hover:bg-dark-surface-tertiary text-gray-700 dark:text-dark-text-secondary flex items-center justify-between transition-colors group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <UserCircle2 size={20} className="text-gray-500 dark:text-dark-text-muted group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-semibold">Update Profile</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
