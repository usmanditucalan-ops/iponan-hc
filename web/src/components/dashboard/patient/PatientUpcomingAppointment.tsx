import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Eye, Calendar, Clock, Activity, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useNotification } from '../../../hooks/useNotification';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentDetailsModal } from '../../appointments/AppointmentDetailsModal';
import { BookAppointmentModal } from '../../appointments/BookAppointmentModal';

export const PatientUpcomingAppointment = () => {
  const { appointments, refresh } = useAppointments();
  const { success, error, warning } = useNotification();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Find the closest upcoming appointment (status CONFIRMED, PENDING, PRE-CONSULT)
  const upcomingApt = Array.isArray(appointments) 
    ? appointments
        .filter(a => ['CONFIRMED', 'PENDING', 'PRE-CONSULT'].includes(a.status))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  if (!upcomingApt) {
    return (
      <div className="bg-white dark:bg-dark-surface-secondary rounded-[11px] shadow-sm border border-gray-100 dark:border-dark-border p-6 flex flex-col justify-center items-center md:h-[320px] h-auto w-full">
        <div className="w-16 h-16 bg-gray-50 dark:bg-dark-surface-tertiary rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-gray-400 dark:text-dark-text-muted-dark" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">No Upcoming Appointments</h3>
        <p className="text-gray-500 dark:text-dark-text-muted-dark text-sm mt-1">You're all caught up! Book a new visit if needed.</p>
        <button 
          onClick={() => navigate('/appointments')}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
        >
          Book Now
        </button>
      </div>
    );
  }

  const handleCancelAppointment = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      warning('Please enter a reason for cancellation.');
      return;
    }

    try {
      setCancelLoading(true);
      const existingNotes = typeof upcomingApt.notes === 'string' ? upcomingApt.notes : '';
      const baseNotes = existingNotes
        .split('\n')
        .filter((line: string) => !line.startsWith('CANCEL_REASON:'))
        .join('\n')
        .trim();
      const mergedNotes = [baseNotes, `CANCEL_REASON: ${reason}`].filter(Boolean).join('\n');
      
      await api.put(`/appointments/${upcomingApt.id}`, {
        status: 'CANCELLED',
        notes: mergedNotes
      });
      
      success('Your appointment has been successfully cancelled.');
      setConfirmCancel(false);
      setCancelReason('');
      setShowDetails(false);
      if (refresh) refresh();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  const patientUser = upcomingApt.patient?.user as any;
  const patientName = patientUser ? `${patientUser.firstName} ${patientUser.lastName}` : 'Me';
  const displayDate = upcomingApt.date ? format(parseISO(upcomingApt.date), 'EEEE, MMMM do, yyyy') : 'Date TBD';
  const reason = upcomingApt.reason?.split(',')[0] || 'General Consultation';

  const VITALS_MARKER = '[NURSE_VITALS_RECORDED]';
  const isReady = upcomingApt.status === 'CONFIRMED' && typeof upcomingApt.notes === 'string' && upcomingApt.notes.includes(VITALS_MARKER);

  const getStatusColor = (status: string, ready: boolean) => {
    if (ready) return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 ring-2 ring-emerald-500/20 animate-pulse';
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      case 'PENDING': return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
      default: return 'bg-gray-100 dark:bg-dark-surface-tertiary text-gray-700 dark:text-dark-text-muted-dark border-gray-200 dark:border-dark-border';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface-secondary rounded-[11px] shadow-sm border border-gray-100 dark:border-dark-border p-6 flex flex-col w-full md:h-[320px] h-auto overflow-hidden justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900 dark:text-dark-text-primary leading-tight">Upcoming Appointment</h2>
          <p className="text-[13px] text-gray-500 dark:text-dark-text-muted-dark mt-1">Next scheduled visit</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${getStatusColor(upcomingApt.status, isReady)}`}>
          {isReady ? 'READY FOR CONSULTATION' : upcomingApt.status}
        </div>
      </div>

      <div className="flex-1 bg-gray-50/50 dark:bg-dark-surface-tertiary/50 rounded-md p-5 border border-gray-100 dark:border-dark-border mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-dark-primary/20 flex items-center justify-center text-blue-600 dark:text-dark-primary font-bold shrink-0">
                {patientName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 dark:text-dark-text-muted-dark">Patient</span>
                <span className="text-base font-bold text-gray-900 dark:text-dark-text-primary">{patientName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text-secondary">
                <Calendar size={16} className="text-gray-400 dark:text-dark-text-muted" />
                <span className="text-sm font-medium">{displayDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text-secondary">
                <Clock size={16} className="text-gray-400 dark:text-dark-text-muted" />
                <span className="text-sm font-medium">{upcomingApt.time || 'TBD'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-dark-text-secondary">
              <Activity size={16} className="text-gray-400 dark:text-dark-text-muted" />
              <span className="text-sm font-medium">{reason}</span>
            </div>
          </div>

          <div className="flex items-end sm:h-full pb-1">
            <button 
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-tertiary text-gray-700 dark:text-dark-text-secondary text-sm font-medium rounded-md border border-gray-200 dark:border-dark-border transition-colors shadow-sm active:scale-95"
            >
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <AppointmentDetailsModal 
          appointment={upcomingApt}
          onClose={() => setShowDetails(false)}
          onEditDetails={() => {
            setShowDetails(false);
            setIsEditing(true);
          }}
          onCancelAppointment={() => setConfirmCancel(true)}
        />
      )}

      {isEditing && (
        <BookAppointmentModal
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            if (refresh) refresh();
          }}
          onBackToDetails={() => {
            setIsEditing(false);
            setShowDetails(true);
          }}
          initialData={(() => {
            const rawReasons = upcomingApt.reason ? upcomingApt.reason.split(', ').map((r: string) => r.trim()) : [];
            const otherPrefix = rawReasons.find((r: string) => r.startsWith('Other:'));
            let otherText = '';
            let filteredReasons = rawReasons;
            
            if (otherPrefix) {
              otherText = otherPrefix.replace('Other:', '').trim();
              filteredReasons = rawReasons.filter((r: string) => !r.startsWith('Other:'));
              filteredReasons.push('Other');
            }

            return {
              id: upcomingApt.id,
              clinicType: upcomingApt.type || 'Face-to-face',
              intakeForm: upcomingApt.intakeForm,
              reasons: filteredReasons,
              otherReason: otherText,
              date: upcomingApt.date ? upcomingApt.date.split('T')[0] : '',
              time: upcomingApt.time,
              notes: upcomingApt.notes,
              reason: upcomingApt.reason,
              patient: upcomingApt.patient,
            };
          })()}
        />
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-dark-surface-secondary w-full max-w-md rounded-lg shadow-xl animate-in zoom-in-95">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-1">
                Cancel Appointment
              </h3>
              <p className="text-gray-500 dark:text-dark-text-secondary text-sm mb-4">
                Please state the reason for canceling your appointment.
              </p>

              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Reason (Required)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 mb-6 rounded border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-sm outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter reason for cancellation..."
              />

              <div className="flex items-center gap-3 w-full">
                <button
                  disabled={cancelLoading}
                  onClick={() => {
                    setConfirmCancel(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-surface-tertiary text-gray-700 dark:text-dark-text-secondary font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={cancelLoading}
                  onClick={handleCancelAppointment}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {cancelLoading && <Loader2 size={16} className="animate-spin" />}
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
