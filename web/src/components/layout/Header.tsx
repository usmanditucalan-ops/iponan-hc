import { Bell, LogOut, Moon, Sun, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationModal } from '../notifications/NotificationModal';
import { useState } from 'react';

import logo from '../../assets/logo.png';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { theme, setUserPreference } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pageMeta: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Clinic operations overview' },
    '/appointments': { title: 'Appointments', subtitle: 'General consultation scheduling' },
    '/medical-records': { title: 'Medical Records', subtitle: 'Electronic health records' },
    '/patients': { title: 'Patients', subtitle: 'Patient registry and profiles' },
    '/settings': { title: 'Settings', subtitle: 'Profile and preferences' },
    '/users': { title: 'User Management', subtitle: 'Clinic access control' },
    '/users/staff': { title: 'Staff Management', subtitle: 'General physician and Nurse accounts' },
    '/users/patients': { title: 'Patient Management', subtitle: 'Registered patient accounts' },
  };

  const current = pageMeta[location.pathname] || { title: 'Barangay Health Clinic', subtitle: 'General consultation system' };

  return (
    <header className="h-auto min-h-[72px] bg-white/95 dark:bg-dark-surface-primary/95 backdrop-blur-md border-b border-border dark:border-dark-border py-2 px-3 md:px-4 flex items-center justify-between sticky top-0 z-20 lg:ml-64 shadow-sm transition-all duration-200">
      {/* Mobile hamburger */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 -ml-1 mr-2 hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary rounded-md transition-colors text-text-secondary dark:text-dark-text-secondary"
        aria-label="Toggle sidebar menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden flex items-center">
          <img src={logo} alt="Logo" className="w-8 h-8" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-text-primary dark:text-dark-text-primary leading-tight truncate">{current.title}</h1>
          <p className="text-xs text-text-muted-dark dark:text-dark-text-muted-dark truncate">{current.subtitle}</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0 ml-2">
        <button
          onClick={() => setUserPreference(theme === 'light' ? 'dark' : 'light')}
          className="p-2 text-text-secondary dark:text-dark-text-secondary hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary rounded transition-colors outline-none"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-text-secondary dark:text-dark-text-secondary hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary rounded transition-colors outline-none"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-dark-surface-primary"></span>
          </button>
          
          <NotificationModal 
            isOpen={isNotificationOpen} 
            onClose={() => setIsNotificationOpen(false)} 
          />
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border dark:border-dark-border hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center text-primary dark:text-dark-primary font-bold border border-primary/20 dark:border-dark-primary/20">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left min-w-[160px]">
              <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary leading-none truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-text-muted dark:text-dark-text-muted-dark truncate">
                {user?.email}
              </p>
            </div>
            <ChevronDown size={14} className="hidden md:block text-text-muted dark:text-dark-text-muted-dark" />
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-surface-secondary rounded-md shadow-lg border border-border dark:border-dark-border py-2 z-20 flex flex-col">
                <div className="px-4 py-2 border-b border-border dark:border-dark-border">
                  <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted-dark truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-text-primary dark:text-dark-text-primary hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary transition-colors"
                >
                  Settings
                </button>
                <div className="h-px bg-border dark:bg-dark-border my-1" />
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
