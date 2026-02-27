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
        <button
          onClick={onClose}
          className="lg:hidden absolute right-3 top-5 p-2 hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary rounded-xl transition-colors text-text-muted dark:text-dark-text-muted-dark"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <div className="px-4 py-5 flex items-center gap-3 border-b border-border dark:border-dark-border">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="font-bold text-base leading-tight text-text-primary dark:text-dark-text-primary">Barangay Iponan</h1>
            <p className="text-[10px] text-text-muted-dark dark:text-dark-text-muted-dark font-medium">Health Clinic</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-dark-text-muted-dark">Main Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative border-l-4",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 dark:from-dark-primary/10 dark:to-dark-accent/10 text-primary dark:text-dark-primary font-semibold border-l-primary dark:border-l-dark-primary"
                    : "text-text-secondary dark:text-dark-text-secondary hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary hover:text-text-primary dark:hover:text-dark-text-primary border-l-transparent"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors",
                  isActive ? "text-primary dark:text-dark-primary" : "text-text-muted-dark dark:text-dark-text-muted-dark group-hover:text-text-primary dark:group-hover:text-dark-text-primary"
                )} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 mt-4 font-bold text-sm focus:ring-2 focus:ring-red-600 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-dark-surface-primary outline-none"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </nav>

        <div className="p-4 pb-6 space-y-3">
          <div className="bg-surface-secondary dark:bg-dark-surface-secondary rounded-xl p-3 border border-border dark:border-dark-border">
            <div className="flex items-center gap-2 mb-3 text-primary dark:text-dark-primary font-bold text-sm">
              <Languages size={16} />
              <span>Language</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {['en', 'fil', 'ceb'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={cn(
                    "text-[10px] font-bold py-1 rounded-md transition-all uppercase",
                    language === lang 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-text-muted hover:bg-white hover:text-primary dark:hover:bg-dark-surface-tertiary"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};
