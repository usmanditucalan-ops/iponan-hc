import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  X,
  Languages
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import logo from '../../assets/logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const getNavItems = () => {
    const role = user?.role;
    
    if (role === 'ADMIN') {
      return [
        { icon: LayoutDashboard, label: 'Admin Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Nurse Accounts', href: '/users/staff' },
        { icon: Users, label: 'Patient Registry', href: '/users/patients' },
        { icon: FileText, label: 'EMR Records', href: '/medical-records' },
        { icon: Settings, label: 'System Settings', href: '/settings' },
      ];
    }
    
    if (role === 'DOCTOR') {
      return [
        { icon: LayoutDashboard, label: 'Physician Dashboard', href: '/dashboard' },
        { icon: Calendar, label: 'Consultation Queue', href: '/appointments' },
        { icon: Users, label: 'Patient Profiles', href: '/patients' },
        { icon: FileText, label: 'EMR Workspace', href: '/medical-records' },
        { icon: Settings, label: 'Account Settings', href: '/settings' },
      ];
    }
    
    if (role === 'STAFF') {
      return [
        { icon: LayoutDashboard, label: 'Nurse Dashboard', href: '/dashboard' },
        { icon: Calendar, label: 'Appointments Queue', href: '/appointments' },
        { icon: Users, label: 'Check-In Desk', href: '/patients' },
        { icon: Settings, label: 'Account Settings', href: '/settings' },
      ];
    }

    return [
      { icon: LayoutDashboard, label: 'Patient Dashboard', href: '/dashboard' },
      { icon: Calendar, label: 'My Appointments', href: '/appointments' },
      { icon: FileText, label: 'My Records', href: '/medical-records' },
      { icon: Settings, label: 'Account Settings', href: '/settings' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 h-screen bg-white dark:bg-dark-surface-primary border-r border-border dark:border-dark-border flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out",
        // On desktop always visible, on mobile hidden by default
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile close button */}
        
        </nav>

        <div className="p-4 pb-6 mt-auto border-t border-border dark:border-dark-border">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 font-bold text-sm focus:ring-2 focus:ring-red-600 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-dark-surface-primary outline-none"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>

        </div>
      </aside>
    </>
  );
};
