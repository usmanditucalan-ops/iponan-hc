import { Users, Calendar as CalendarIcon, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../context/AuthContext';

interface StatCardsProps {
  view?: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';
}

export const StatCards = ({ view }: StatCardsProps) => {
  const { stats, loading, error } = useDashboardStats();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 h-32 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary dark:text-dark-primary" size={24} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl text-sm">{error}</div>;
  }

  const roleView = view || (user?.role as any) || 'ADMIN';
  const isPatient = roleView === 'PATIENT';

  const patientCards = (isPatient && Array.isArray(stats?.stats)) ? (stats.stats as any[]).map((s: any, i: number) => ({
    label: s.label,
    value: s.value,
    trend: s.trend,
    trendLabel: '',
    icon: [Users, CalendarIcon, FileText][i] || FileText,
    iconBg: 'bg-primary-light',
    iconColor: 'text-primary'
  })) : [];

  const adminCards = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients || '0',
      trend: stats?.trends?.patients || '0%',
      trendLabel: 'from last month',
      icon: Users,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    },
    {
      label: 'Appointments Today',
      value: stats?.appointmentsToday || '0',
      trend: stats?.trends?.appointments || '0 today',
      trendLabel: 'scheduled visits',
      icon: CalendarIcon,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    },
    {
      label: 'Medical Records',
      value: stats?.totalRecords || '0',
      trend: stats?.trends?.records || '0%',
      trendLabel: 'total records',
      icon: FileText,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingCount || '0',
      trend: stats?.pendingCount > 0 ? 'Action Required' : 'All Clear',
      trendLabel: 'pending requests',
      icon: TrendingUp,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }
  ];

  const doctorCards = [
    {
      label: 'Consultations Today',
      value: stats?.appointmentsToday || '0',
      trend: stats?.trends?.appointments || '0 today',
      trendLabel: 'physician queue',
      icon: CalendarIcon,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    },
    {
      label: 'Medical Records',
      value: stats?.totalRecords || '0',
      trend: stats?.trends?.records || '0%',
      trendLabel: 'general consultation records',
      icon: FileText,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingCount || '0',
      trend: stats?.pendingCount > 0 ? 'Review needed' : 'All clear',
      trendLabel: 'for physician review',
      icon: TrendingUp,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }
  ];

  const staffCards = [
    {
      label: 'Check-ins Today',
      value: stats?.appointmentsToday || '0',
      trend: stats?.trends?.appointments || '0 today',
      trendLabel: 'nurse desk load',
      icon: CalendarIcon,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingCount || '0',
      trend: stats?.pendingCount > 0 ? 'Needs triage' : 'Up to date',
      trendLabel: 'to confirm',
      icon: TrendingUp,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Registered Patients',
      value: stats?.totalPatients || '0',
      trend: stats?.trends?.patients || '0%',
      trendLabel: 'clinic census',
      icon: Users,
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary'
    }
  ];

  const cards =
    roleView === 'PATIENT'
      ? patientCards
      : roleView === 'DOCTOR'
        ? doctorCards
        : roleView === 'STAFF'
          ? staffCards
          : adminCards;
  const gridClass =
    roleView === 'ADMIN'
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5';

  return (
    <div className={gridClass}>
      {cards.map((stat: any) => (
        <Card key={stat.label} className="p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all border border-border dark:border-dark-border">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.iconBg} bg-opacity-20`}>
              <stat.icon className={stat.iconColor} size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-wide">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{stat.value}</h3>
                <div className="flex items-center text-xs font-medium">
                  <span className={`${(stat.trend?.toString() || '').startsWith('+') ? 'text-emerald-500' : 'text-blue-500'} flex items-center`}>
                     {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
