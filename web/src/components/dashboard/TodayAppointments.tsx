import { useState } from 'react';
import { Clock, Loader2, Calendar, ClipboardCheck, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { Card } from '../ui/Card';
import { useAppointments } from '../../hooks/useAppointments';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import api from '../../services/api';

type DashboardView = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';

interface TodayAppointmentsProps {
  view?: DashboardView;
}

export const TodayAppointments = ({ view = 'ADMIN' }: TodayAppointmentsProps) => {
  const { appointments, loading, error, refresh } = useAppointments();
  const [activeTab, setActiveTab] = useState<'queue' | 'requests'>('queue');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  const handleConfirm = async (id: string) => {
    try {
      setUpdatingId(id);
      await api.put(`/appointments/${id}`, { status: 'CONFIRMED' });
      success('Appointment confirmed successfully!');
      refresh();
    } catch {
      notifyError('Failed to confirm appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="flex-1 flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1 flex items-center justify-center text-red-500 dark:text-red-400">
        {error}
      </Card>
    );
  }

  const allApts = Array.isArray(appointments) ? appointments : [];
  const queue = allApts.filter(a => a.status === 'CONFIRMED');
  const requests = allApts.filter(a => a.status === 'PENDING');
  const upcoming = allApts.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status));
  const currentData =
    view === 'PATIENT'
      ? upcoming
      : activeTab === 'queue'
        ? queue
        : requests;
  const showRequestsTab = view === 'ADMIN' || view === 'STAFF';
  const title =
    view === 'PATIENT'
      ? 'My Appointments Today'
      : view === 'DOCTOR'
        ? 'Consultation Queue'
        : view === 'STAFF'
          ? 'Appointments Queue'
          : 'Management Queue';
  const subTitle =
    view === 'PATIENT'
      ? 'TODAY AT BARANGAY HEALTH CLINIC'
      : view === 'DOCTOR'
        ? 'GENERAL PHYSICIAN VIEW'
        : view === 'STAFF'
          ? 'CHECK-IN AND APPOINTMENTS'
          : 'LIVE CLINIC FEED';

  return (
    <Card className="flex-1 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-black text-text-primary dark:text-dark-text-primary uppercase tracking-tight">{title}</h3>
          <p className="text-[10px] text-text-muted dark:text-dark-text-muted-dark font-bold font-mono">{subTitle}</p>
        </div>
        
        {showRequestsTab && (
        <div className="flex bg-surface-secondary dark:bg-dark-surface-tertiary p-1 rounded-md border border-border dark:border-dark-border">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded text-xs font-black transition-all ${
              activeTab === 'queue' 
              ? 'bg-white dark:bg-dark-surface-secondary text-primary dark:text-dark-primary shadow-sm' 
              : 'text-text-muted-dark hover:text-text-primary dark:text-dark-text-muted-dark'
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-1.5 rounded text-xs font-black transition-all ${
              activeTab === 'requests' 
              ? 'bg-white dark:bg-dark-surface-secondary text-primary dark:text-dark-primary shadow-sm' 
              : 'text-text-muted-dark hover:text-text-primary dark:text-dark-text-muted-dark'
            }`}
          >
            Requests ({requests.length})
          </button>
        </div>
        )}
      </div>

      <div className="space-y-3">
        {currentData.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={
              view === 'PATIENT'
                ? 'No Appointments Today'
                : activeTab === 'queue'
                  ? 'Queue is Empty'
                  : 'No Pending Requests'
            }
            description={
              view === 'PATIENT'
                ? 'You have no active appointments for today.'
                : activeTab === 'queue'
                  ? 'No patients are currently in the confirmed queue.'
                  : 'There are no new appointment requests to review.'
            }
            className="py-12"
          />
        ) : (
          currentData.map((apt) => {
            const patientUser = apt.patient?.user as any;
            const firstName = patientUser?.firstName || 'Patient';
            const lastName = patientUser?.lastName || '';
            const initial = firstName.charAt(0).toUpperCase() || 'P';
            const hasIntake = !!apt.intakeForm;

            return (
              <div key={apt.id} className="group relative bg-white dark:bg-dark-surface-secondary/50 border border-border dark:border-dark-border rounded-lg p-4 hover:shadow-lg hover:border-primary/20 dark:hover:border-dark-primary/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/5 dark:bg-dark-primary/10 text-primary dark:text-dark-primary rounded-lg flex items-center justify-center font-black text-lg border border-primary/10">
                        {initial}
                      </div>
                      {hasIntake && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-surface-secondary">
                          <ClipboardCheck size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-text-primary dark:text-dark-text-primary tracking-tight">
                          {firstName} {lastName}
                        </h4>
                        {!hasIntake && activeTab === 'queue' && view !== 'PATIENT' && (
                           <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-sm border border-amber-100 dark:border-amber-900/30">
                              <Smartphone size={10} /> Needs Intake
                           </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-text-muted-dark dark:text-dark-text-muted-dark font-bold uppercase tracking-wider">
                          <Clock size={12} className="text-primary" />
                          {apt.time}
                        </div>
                        <span className="w-1 h-1 bg-border dark:bg-dark-border rounded-full" />
                        <span className="text-[10px] font-bold text-text-muted dark:text-dark-text-muted-dark">{apt.reason.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {showRequestsTab && activeTab === 'requests' ? (
                      <button
                        onClick={() => handleConfirm(apt.id)}
                        disabled={updatingId === apt.id}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
                      >
                        {updatingId === apt.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Confirm
                      </button>
                    ) : view === 'STAFF' ? (
                      <button
                        onClick={() => navigate('/appointments')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                      >
                        View Summary
                        <ArrowRight size={12} />
                      </button>
                    ) : view === 'DOCTOR' ? (
                      <button
                        onClick={() => navigate('/appointments')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                      >
                        Consult
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/appointments')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20"
                      >
                        Open
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border dark:border-dark-border flex justify-center">
        <button
          onClick={() => navigate('/appointments')}
          className="text-[10px] font-black text-text-muted hover:text-primary dark:text-dark-text-muted-dark dark:hover:text-dark-primary uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          {view === 'PATIENT' ? 'View My Appointment History' : 'View Full Master Calendar'}
          <ArrowRight size={12} />
        </button>
      </div>
    </Card>
  );
};
