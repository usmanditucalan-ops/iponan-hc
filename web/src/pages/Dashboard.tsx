import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WelcomeTour } from '../components/common/WelcomeTour';
import { DiseaseReportsChart } from '../components/dashboard/DiseaseReportsChart';
import { DashboardAppointmentsList } from '../components/dashboard/DashboardAppointmentsList';
import { RecentPatientsList } from '../components/dashboard/RecentPatientsList';
import { AppointmentsTrendChart } from '../components/dashboard/AppointmentsTrendChart';
import { DashboardCalendar } from '../components/dashboard/DashboardCalendar';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';

// Patient specific components
import { PatientSummaryCards } from '../components/dashboard/patient/PatientSummaryCards';
import { PatientUpcomingAppointment } from '../components/dashboard/patient/PatientUpcomingAppointment';
import { PatientRecentVisits } from '../components/dashboard/patient/PatientRecentVisits';
import { PatientQuickActions } from '../components/dashboard/patient/PatientQuickActions';

import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!user && isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="animate-spin text-primary dark:text-dark-primary" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  const renderStaffDashboardView = () => (
    <div className="grid grid-cols-12 gap-6 w-full items-start">
      {/* Top Row */}
      <div className="col-span-12 xl:col-span-4 self-stretch">
        <DiseaseReportsChart />
      </div>
      <div className="col-span-12 xl:col-span-5 self-stretch">
        <DashboardAppointmentsList />
      </div>
      <div className="col-span-12 xl:col-span-3 self-stretch">
        <RecentPatientsList />
      </div>

      {/* Bottom Row */}
      <div className="col-span-12 xl:col-span-6 self-stretch">
        <AppointmentsTrendChart />
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-3 self-stretch">
        <DashboardCalendar />
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-3 self-stretch">
        <QuickActionsPanel />
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    if (!user) return null;

    if (user.role === 'ADMIN' || user.role === 'DOCTOR' || user.role === 'STAFF') {
      return renderStaffDashboardView();
    }

    switch (user.role) {
      case 'PATIENT':
        return (
          <div className="flex flex-col gap-6 w-full">
            {/* Top Row - Summary Cards */}
            <PatientSummaryCards />
            
            {/* Split layout into exact rows to guarantee alignment alongside explicit heights */}
            {/* Row 1: Upcoming Appointment (66%) & Calendar (33%) -> Both Fixed to 320px */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
              <div className="xl:col-span-8">
                <PatientUpcomingAppointment />
              </div>
              <div className="xl:col-span-4">
                <DashboardCalendar className="md:h-[320px] h-auto" />
              </div>
            </div>

            {/* Row 2: Recent Visits (66%) & Quick Actions (33%) -> Both Fixed to 360px */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
              <div className="xl:col-span-8">
                <PatientRecentVisits />
              </div>
              <div className="xl:col-span-4">
                <PatientQuickActions />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">Role Not Recognized</h3>
            <p className="text-text-muted-dark dark:text-dark-text-muted-dark max-w-xs">Your account role ({user.role}) is not configured for the dashboard. Please contact the administrator.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
      <WelcomeTour />
    </DashboardLayout>
  );
};

export default Dashboard;
