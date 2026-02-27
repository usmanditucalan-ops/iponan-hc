import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Users, FileText, UserPlus, FileClock, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickActionsPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const role = user?.role || 'STAFF'; // Default fallback

  const ActionRow = ({ title, description, icon: Icon, onClick, gradientClass }: { title: string; description: string; icon: LucideIcon; onClick: () => void; gradientClass: string }) => (
    <button 
      onClick={onClick}
      className={`w-full h-[84px] group relative overflow-hidden rounded-[11px] p-4 flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md border border-white/20 active:scale-[0.98] ${gradientClass}`}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
      <div className="w-11 h-11 rounded-md bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
        <Icon className="text-white" size={20} />
      </div>
      <div className="flex flex-col items-start justify-center flex-1 h-full pt-0.5">
        <span className="text-white font-bold text-[14px] text-left leading-none mb-1">
          {title}
        </span>
        <span className="text-white/80 font-medium text-[11px] text-left leading-snug break-words line-clamp-2">
          {description}
        </span>
      </div>
    </button>
  );

  const renderAdminActions = () => (
    <>
      <ActionRow 
        title="Manage Patients" 
        description="Add or update patient records."
        icon={Users} 
        onClick={() => navigate('/users/patients')} 
        gradientClass="bg-gradient-to-r from-blue-500 to-indigo-600"
      />
      <ActionRow 
        title="Manage Staff" 
        description="Add or update clinic staff/doctors."
        icon={UserPlus} 
        onClick={() => navigate('/users/staff')} 
        gradientClass="bg-gradient-to-r from-emerald-500 to-teal-600"
      />
      <ActionRow 
        title="View Patient Records" 
        description="Access full medical history."
        icon={FileText} 
        onClick={() => navigate('/medical-records')} 
        gradientClass="bg-gradient-to-r from-violet-500 to-purple-600"
      />
    </>
  );

  const renderDoctorActions = () => (
    <>
      <ActionRow 
        title="Consultation Queue" 
        description="View your confirmed patients."
        icon={FileClock} 
        onClick={() => navigate('/appointments')} 
        gradientClass="bg-gradient-to-r from-blue-500 to-indigo-600"
      />
      <ActionRow 
        title="Manage Patients" 
        description="View assigned patient files."
        icon={Users} 
        onClick={() => navigate('/patients')} 
        gradientClass="bg-gradient-to-r from-emerald-500 to-teal-600"
      />
      <ActionRow 
        title="View Patient Records" 
        description="Review medical histories."
        icon={FileText} 
        onClick={() => navigate('/medical-records')} 
        gradientClass="bg-gradient-to-r from-violet-500 to-purple-600"
      />
    </>
  );

  const renderNurseActions = () => (
    <>
      <ActionRow 
        title="Appointments Queue" 
        description="Manage triage and vital signs."
        icon={CalendarPlus} 
        onClick={() => navigate('/appointments')} 
        gradientClass="bg-gradient-to-r from-blue-500 to-indigo-600"
      />
      <ActionRow 
        title="Manage Patients" 
        description="Add new patient registrations."
        icon={Users} 
        onClick={() => navigate('/patients')} 
        gradientClass="bg-gradient-to-r from-emerald-500 to-teal-600"
      />
      <ActionRow 
        title="Manage Profile" 
        description="Update your account settings."
        icon={UserCog} 
        onClick={() => navigate('/settings')} 
        gradientClass="bg-gradient-to-r from-violet-500 to-purple-600"
      />
    </>
  );

  return (
    <div className="w-full h-full min-h-[350px] bg-white dark:bg-dark-surface-secondary border-2 border-border/50 dark:border-dark-border rounded-[17px] p-6 flex flex-col shadow-sm">
      <h3 className="text-[17px] font-bold text-text-primary dark:text-dark-text-primary mb-5 flex items-center gap-2">
        <span>Quick Actions</span>
      </h3>
      
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {role === 'ADMIN' && renderAdminActions()}
        {role === 'DOCTOR' && renderDoctorActions()}
        {role === 'STAFF' && renderNurseActions()}
      </div>
    </div>
  );
};
