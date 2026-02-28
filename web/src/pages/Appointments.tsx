import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { EmptyState } from '../components/common/EmptyState';
import { Calendar, Plus, ChevronLeft, ChevronRight, ChevronDown, Loader2, CalendarX, X, Check, FileText,
  Printer,
  AlertCircle,
  Search,
  ClipboardList,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { ConsultationFormModal } from '../components/appointments/ConsultationFormModal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import api from '../services/api';
import { PrintableForm } from '../components/common/PrintableForm';
import { BookAppointmentModal } from '../components/appointments/BookAppointmentModal';

const Appointments = () => {
  const { user } = useAuth();
  const { success, error, warning } = useNotification();
  const navigate = useNavigate();
  const [showBookModal, setShowBookModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    reasons: [] as string[],
    otherReason: '',
    confirmed: false,
    date: '',
    time: '08:00 AM',
    notes: '',
    id: null as string | null
  });

  const canBook = user?.role === 'PATIENT';
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  /* View Modal State */
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewAppointment, setSelectedViewAppointment] = useState<any>(null);

  // Fetch all appointments for history display
  const fetchMyAppointments = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/appointments?t=' + new Date().getTime());
      setMyAppointments(Array.isArray(res.data.appointments) ? res.data.appointments : []);
    } catch {
      setMyAppointments([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const hasOpenedInitialView = useRef(false);

  // Handle URL query parameters for auto-opening modal
  useEffect(() => {
    if (myAppointments.length > 0 && !hasOpenedInitialView.current) {
      const searchParams = new URLSearchParams(window.location.search);
      const viewId = searchParams.get('view');
      if (viewId) {
        const aptToView = myAppointments.find(a => a.id === viewId);
        if (aptToView) {
          openAppointmentDetails(aptToView);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      hasOpenedInitialView.current = true;
    }
  }, [myAppointments]);

  /* View Appointment Modal Required State */
  const [bookingType, setBookingType] = useState<'myself' | 'dependent'>('myself');
  const [clinicType, setClinicType] = useState<string>('General Consultation - Barangay Health Clinic');
  const [dependentData, setDependentData] = useState({
    guardianName: user ? `${user.firstName} ${user.lastName}` : '',
    relation: '',
    patientName: '',
    dob: '',
    gender: 'MALE'
  });

  const [isEditingAppointment, setIsEditingAppointment] = useState(false);

  /* Consultation Modal State */
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  /* Print Modal State */
  const [printData, setPrintData] = useState<{ visible: boolean; type: 'intake' | 'consultation'; appointment: any }>({
    visible: false,
    type: 'intake',
    appointment: null
  });

  /* Confirmation Modal State */
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    appointmentId: string | null;
    status: string | null;
    title: string;
    message: string;
    actionType: 'confirm' | 'delete' | 'complete';
  }>({
    visible: false,
    appointmentId: null,
    status: null,
    title: '',
    message: '',
    actionType: 'confirm'
  });

  const handleStatusUpdate = (id: string, newStatus: string) => {
    let title = 'Confirm Action';
    let message = `Are you sure you want to mark this appointment as ${newStatus}?`;
    let actionType: 'confirm' | 'delete' | 'complete' = 'confirm';

    if (newStatus === 'CANCELLED') {
      title = 'Cancel Appointment';
      message = 'Are you sure you want to cancel this appointment? This action cannot be undone.';
      actionType = 'delete';
    } else if (newStatus === 'COMPLETED') {
      title = 'Complete Appointment';
      message = 'Mark this appointment as completed?';
      actionType = 'complete';
    } else if (newStatus === 'CONFIRMED') {
      title = 'Confirm Appointment';
      message = 'Confirm this appointment request for general consultation?';
      actionType = 'confirm';
    }

    setConfirmModal({
      visible: true,
      appointmentId: id,
      status: newStatus,
      title,
      message,
      actionType
    });
  };

  const confirmAction = async () => {
    if (!confirmModal.appointmentId || !confirmModal.status) return;

    try {
      if (confirmModal.status === 'CANCELLED') {
        await api.delete(`/appointments/${confirmModal.appointmentId}`);
      } else {
        await api.put(`/appointments/${confirmModal.appointmentId}`, { status: confirmModal.status });
      }
      success(`Appointment marked as ${confirmModal.status}`);
      fetchMyAppointments();
      
      setConfirmModal({ ...confirmModal, visible: false });



    } catch(err: any) {
      error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const [nurseVitalsModal, setNurseVitalsModal] = useState<{ visible: boolean; step: 1 | 2; appointment: any | null }>({
    visible: false,
    step: 1,
    appointment: null
  });
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; appointment: any | null; reason: string; loading: boolean }>({
    visible: false,
    appointment: null,
    reason: '',
    loading: false
  });
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; appointment: any | null; reason: string; loading: boolean }>({
    visible: false,
    appointment: null,
    reason: '',
    loading: false
  });
  const [nurseVitals, setNurseVitals] = useState({
    temperature: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: ''
  });

  const resetNurseVitals = () => {
    setNurseVitals({
      temperature: '',
      systolic: '',
      diastolic: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      notes: ''
    });
  };

  const VITALS_MARKER = '[NURSE_VITALS_RECORDED]';

  const calculateAgeFromDob = (dobRaw: string | Date | null | undefined) => {
    if (!dobRaw) return 'N/A';
    const dob = new Date(dobRaw);
    if (Number.isNaN(dob.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return String(age);
  };

  const openAppointmentDetails = (apt: any) => {
    setSelectedViewAppointment(apt);

    const isDependent = apt.notes?.includes('[DEPENDENT APPOINTMENT]');
    if (isDependent) {
      setBookingType('dependent');
      const nameMatch = apt.notes.match(/Dependent Name:\s*(.*)/);
      const dobMatch = apt.notes.match(/DOB:\s*(.*)/);
      const genderMatch = apt.notes.match(/Gender:\s*(.*)/);
      const guardMatch = apt.notes.match(/Guardian:\s*(.*)/);
      const relMatch = apt.notes.match(/Relation:\s*(.*)/);
      setDependentData({
        patientName: nameMatch ? nameMatch[1].trim() : '',
        dob: dobMatch ? dobMatch[1].trim() : '',
        gender: genderMatch ? genderMatch[1].trim() : 'MALE',
        guardianName: guardMatch ? guardMatch[1].trim() : '',
        relation: relMatch ? relMatch[1].trim() : ''
      });
    } else {
      setBookingType('myself');
    }

    let rawReason = apt.reason || '';
    const clinicMatch = rawReason.match(/^\[(.*?)\]\s*(.*)/);
    if (clinicMatch) {
      setClinicType(clinicMatch[1].trim());
      rawReason = clinicMatch[2].trim();
    } else {
      setClinicType('General Consultation');
    }

    const reasonsArray = rawReason.split(',').map((r: string) => r.trim()).filter(Boolean);
    const otherReasonStr = reasonsArray.find((r: string) => r.startsWith('Other:'));
    const cleanReasons = reasonsArray.filter((r: string) => !r.startsWith('Other:'));

    if (otherReasonStr) {
      cleanReasons.push('Other');
      const extractedOther = otherReasonStr.replace('Other:', '').trim();
      setAppointmentData(prev => ({ ...prev, reasons: cleanReasons, otherReason: extractedOther }));
    } else {
      setAppointmentData(prev => ({ ...prev, reasons: cleanReasons, otherReason: '' }));
    }

    setIsEditingAppointment(false);
    setShowViewModal(true);

    const hasVitalsMarker = typeof apt?.notes === 'string' && apt.notes.includes(VITALS_MARKER);
    if (apt?.patientId && apt?.status === 'CONFIRMED' && hasVitalsMarker) {
      api.get(`/vital-signs/patient/${apt.patientId}`)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          const latest = list[0] || null;
          setSelectedViewAppointment((prev: any) => {
            if (!prev || prev.id !== apt.id) return prev;
            return { ...prev, latestVitalSign: latest };
          });
        })
        .catch(() => {
          setSelectedViewAppointment((prev: any) => {
            if (!prev || prev.id !== apt.id) return prev;
            return { ...prev, latestVitalSign: null };
          });
        });
    } else {
      setSelectedViewAppointment((prev: any) => {
        if (!prev || prev.id !== apt.id) return prev;
        return { ...prev, latestVitalSign: null };
      });
    }
  };

  const handleNurseConfirmAppointment = async (appointment: any) => {
    try {
      const currentNotes = typeof appointment?.notes === 'string' ? appointment.notes : '';
      const cleanedNotes = currentNotes
        .split('\n')
        .filter((line: string) => !line.startsWith('REJECTION_REASON:'))
        .join('\n')
        .trim();
      await api.put(`/appointments/${appointment.id}`, { status: 'CONFIRMED', notes: cleanedNotes });
      success('Appointment confirmed. You can now record vital signs.');
      setSelectedViewAppointment((prev: any) => (prev ? { ...prev, status: 'CONFIRMED', notes: cleanedNotes } : prev));
      fetchMyAppointments();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to confirm appointment.');
    }
  };

  const openRejectModal = (appointment: any) => {
    setRejectModal({
      visible: true,
      appointment,
      reason: '',
      loading: false
    });
  };

  const submitRejectAppointment = async () => {
    if (!rejectModal.appointment) return;
    const reason = rejectModal.reason.trim();
    if (!reason) {
      warning('Please enter a reason for rejection.');
      return;
    }

    try {
      setRejectModal((prev) => ({ ...prev, loading: true }));
      const existingNotes = typeof rejectModal.appointment.notes === 'string' ? rejectModal.appointment.notes : '';
      const baseNotes = existingNotes
        .split('\n')
        .filter((line: string) => !line.startsWith('REJECTION_REASON:'))
        .join('\n')
        .trim();
      const mergedNotes = [baseNotes, `REJECTION_REASON: ${reason}`].filter(Boolean).join('\n');
      const res = await api.put(`/appointments/${rejectModal.appointment.id}`, {
        status: 'CANCELLED',
        notes: mergedNotes
      });
      success('Appointment rejected.');
      setRejectModal({ visible: false, appointment: null, reason: '', loading: false });
      const updated = res?.data?.appointment;
      if (updated) {
        setSelectedViewAppointment(updated);
      }
      setShowViewModal(true);
      fetchMyAppointments();
    } catch (err: any) {
      setRejectModal((prev) => ({ ...prev, loading: false }));
      error(err.response?.data?.error || 'Failed to reject appointment.');
    }
  };

  const openCancelModal = (appointment: any) => {
    setCancelModal({
      visible: true,
      appointment,
      reason: '',
      loading: false
    });
  };

  const submitCancelAppointment = async () => {
    if (!cancelModal.appointment) return;
    const reason = cancelModal.reason.trim();
    if (!reason) {
      warning('Please enter a reason for cancellation.');
      return;
    }

    try {
      setCancelModal((prev) => ({ ...prev, loading: true }));
      const existingNotes = typeof cancelModal.appointment.notes === 'string' ? cancelModal.appointment.notes : '';
      const baseNotes = existingNotes
        .split('\n')
        .filter((line: string) => !line.startsWith('CANCEL_REASON:'))
        .join('\n')
        .trim();
      const mergedNotes = [baseNotes, `CANCEL_REASON: ${reason}`].filter(Boolean).join('\n');
      
      const res = await api.put(`/appointments/${cancelModal.appointment.id}`, {
        status: 'CANCELLED',
        notes: mergedNotes
      });
      
      success('Your appointment has been successfully cancelled.');
      setCancelModal({ visible: false, appointment: null, reason: '', loading: false });
      
      const updated = res?.data?.appointment;
      if (updated) {
         setSelectedViewAppointment(updated);
      }
      setShowViewModal(true);
      fetchMyAppointments();
    } catch (err: any) {
      setCancelModal((prev) => ({ ...prev, loading: false }));
      error(err.response?.data?.error || 'Failed to cancel appointment.');
    }
  };

  const handleSubmitNurseVitals = async () => {
    if (!nurseVitalsModal.appointment?.patientId) {
      warning('Patient ID is missing for this appointment.');
      return;
    }
    if (nurseVitalsModal.appointment?.status !== 'CONFIRMED') {
      warning('Please confirm the appointment before recording vital signs.');
      return;
    }

    const hasAnyVital = [
      nurseVitals.temperature,
      nurseVitals.systolic,
      nurseVitals.diastolic,
      nurseVitals.heartRate,
      nurseVitals.respiratoryRate,
      nurseVitals.oxygenSaturation,
      nurseVitals.weight,
      nurseVitals.height
    ].some(Boolean);

    if (!hasAnyVital) {
      warning('Please enter at least one vital sign.');
      return;
    }

    try {
      const bloodPressure =
        nurseVitals.systolic && nurseVitals.diastolic
          ? `${nurseVitals.systolic}/${nurseVitals.diastolic}`
          : undefined;

      const savedVitals = await api.post('/vital-signs', {
        patientId: nurseVitalsModal.appointment.patientId,
        bloodPressure,
        heartRate: nurseVitals.heartRate || undefined,
        temperature: nurseVitals.temperature || undefined,
        weight: nurseVitals.weight || undefined,
        height: nurseVitals.height || undefined,
        respiratoryRate: nurseVitals.respiratoryRate || undefined,
        oxygenSaturation: nurseVitals.oxygenSaturation || undefined,
        notes: nurseVitals.notes || undefined
      });

      const currentNotes = typeof nurseVitalsModal.appointment?.notes === 'string' ? nurseVitalsModal.appointment.notes : '';
      const markerStamp = `${VITALS_MARKER} ${new Date().toISOString()}`;
      const nextNotes = currentNotes.includes(VITALS_MARKER) ? currentNotes : [currentNotes, markerStamp].filter(Boolean).join('\n');
      await api.put(`/appointments/${nurseVitalsModal.appointment.id}`, { status: 'CONFIRMED', notes: nextNotes });

      success('Vital signs saved successfully.');
      const updatedAppointment = {
        ...nurseVitalsModal.appointment,
        status: 'CONFIRMED',
        notes: nextNotes,
        latestVitalSign: savedVitals.data
      };
      setSelectedViewAppointment(updatedAppointment);
      setShowViewModal(true);
      setNurseVitalsModal({ visible: false, step: 1, appointment: null });
      resetNurseVitals();
      fetchMyAppointments();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to save vital signs.');
    }
  };



  const handlePrintSlip = (apt: any) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      const d = new Date(apt.date);
      const formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Appointment Slip</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; text-align: center; border: 2px dashed #333; margin: 20px; }
              .header { margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
              .sub { font-size: 14px; color: #666; }
              .content { text-align: left; margin: 0 auto; width: 80%; border-top: 2px solid #eee; border-bottom: 2px solid #eee; padding: 20px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .label { font-weight: bold; color: #555; }
              .value { font-weight: bold; font-size: 16px; }
              .footer { margin-top: 40px; font-size: 12px; color: #888; }
              .btn { display: none; }
              @media print {
                body { border: none; margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Barangay Iponan Health Clinic</div>
              <div class="sub">Official Appointment Slip</div>
            </div>
            
            <div class="content">
              <div class="row">
                <span class="label">Patient Name:</span>
                <span class="value">${userName}</span>
              </div>
              <div class="row">
                <span class="label">Service/Reason:</span>
                <span class="value">${apt.reason}</span>
              </div>
              <div class="row">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="row">
                <span class="label">Time:</span>
                <span class="value">${apt.time}</span>
              </div>
              <div class="row">
                <span class="label">Status:</span>
                <span class="value">${apt.status}</span>
              </div>
              <div class="row">
                <span class="label">Slip ID:</span>
                <span class="value text-xs">#${apt.id.slice(0, 8)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Please present this slip at the reception desk 15 minutes before your scheduled time.</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Separate upcoming vs past appointments
  const [filterTimeline, setFilterTimeline] = useState<'all' | 'today' | 'upcoming' | 'past' | 'waiting' | 'ready'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  console.log('--- FILTER DEBUG ---');
  console.log('filterStatus:', filterStatus);
  console.log('myAppointments count:', myAppointments?.length);

  const filteredAppointments = myAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const isToday = aptDate.toDateString() === now.toDateString();
    const isFuture = aptDate >= now;
    const isPast = aptDate < now;
    const isCompletedOrCancelled = ['COMPLETED', 'CANCELLED'].includes(apt.status);

    const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes(VITALS_MARKER);

    let timelineMatch = true;
    if (filterTimeline === 'today') timelineMatch = isToday && !isCompletedOrCancelled;
    if (filterTimeline === 'upcoming') timelineMatch = isFuture && !isToday && !isCompletedOrCancelled;
    if (filterTimeline === 'past') timelineMatch = isPast || isCompletedOrCancelled;
    // 'Waiting' means the patient has arrived, but vitals are NOT YET recorded
    if (filterTimeline === 'waiting') timelineMatch = apt.status === 'CONFIRMED' && !hasVitalsMarker;
    // 'Ready' means the vitals are recorded and the doctor is ready to see them
    if (filterTimeline === 'ready') timelineMatch = apt.status === 'CONFIRMED' && hasVitalsMarker;

    // Specific status filters
    let statusMatch = true;
    if (filterStatus === 'pending') statusMatch = apt.status === 'PENDING';
    if (filterStatus === 'confirmed') statusMatch = apt.status === 'CONFIRMED';
    if (filterStatus === 'completed') statusMatch = apt.status === 'COMPLETED';
    if (filterStatus === 'cancelled') statusMatch = apt.status === 'CANCELLED' && !(typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:'));
    if (filterStatus === 'rejected') statusMatch = apt.status === 'CANCELLED' && (typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:'));

    const patient = apt.patient?.user;
    const firstName = patient?.firstName?.toLowerCase() || '';
    const lastName = patient?.lastName?.toLowerCase() || '';
    const reason = (apt.reason || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const searchMatch = firstName.includes(query) || lastName.includes(query) || reason.includes(query);

    return timelineMatch && statusMatch && searchMatch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout>
      <div className="mb-5 flex flex-col items-start gap-4 w-full">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark" size={16} />
             <input
               type="text"
               placeholder="Search appointments..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all text-sm text-text-primary dark:text-dark-text-primary shadow-sm"
             />
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
             {/* Inline Filters */}
             <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
               <div className="relative shrink-0">
                 <select 
                     value={filterTimeline}
                     onChange={(e) => setFilterTimeline(e.target.value as any)}
                     className="bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-md pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer shadow-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary"
                 >
                     <option value="all">All Appointments</option>
                     {user?.role === 'DOCTOR' ? (
                       <>
                         <option value="waiting">Waiting (No Vitals)</option>
                         <option value="ready">Ready (Vitals Recorded)</option>
                       </>
                     ) : (
                       <>
                         <option value="today">Today</option>
                         <option value="upcoming">Upcoming</option>
                         <option value="past">Past History</option>
                       </>
                     )}
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted-dark pointer-events-none" />
               </div>

               <div className="relative shrink-0">
                 <select 
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value as any)}
                     className="bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-md pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer shadow-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary"
                 >
                     <option value="all">All Statuses</option>
                     <option value="pending">Pending</option>
                     <option value="confirmed">Confirmed</option>
                     <option value="completed">Completed</option>
                     <option value="cancelled">Cancelled</option>
                     <option value="rejected">Rejected</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted-dark pointer-events-none" />
               </div>
             </div>

             {canBook && (
               <button
                 onClick={() => setShowBookModal(true)}
                 className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/30 dark:shadow-dark-primary/30 whitespace-nowrap"
               >
                 <Plus size={18} />
                 Book New
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
          <div className="bg-white dark:bg-dark-surface-secondary p-6 rounded-lg border border-border dark:border-dark-border shadow-sm dark:shadow-lg">
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-6 flex items-center gap-2">
              <Calendar className="text-primary dark:text-dark-primary" size={20} />
              {filterStatus === 'all' ? 'All Appointments' : 
               filterStatus === 'today' ? "Today's Schedule" :
               filterStatus === 'upcoming' ? 'Upcoming Schedule' : 'Appointment History'}
            </h3>
            <div className="space-y-4">
              {historyLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" size={24} /></div>
              ) : filteredAppointments.length === 0 ? (
                <EmptyState
                  icon={CalendarX}
                  title="No Appointments Found"
                  description={`No appointments found for the selected filter: ${filterStatus}.`}
                  actionLabel={canBook && filterStatus !== 'past' ? "Book Now" : undefined}
                  onAction={canBook && filterStatus !== 'past' ? () => setShowBookModal(true) : undefined}
                  className="py-12"
                />
              ) : user?.role === 'PATIENT' ? (
                 <div className="overflow-x-hidden">
                   <table className="w-full table-fixed text-left border-collapse">
                     <thead>
                       <tr className="border-b border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted-dark text-[10px] uppercase tracking-wider">
                         <th className="px-2 py-2 font-bold w-[20%]">User</th>
                         <th className="px-2 py-2 font-bold w-[24%] border-l border-border/60 dark:border-dark-border/60">Contact Info</th>
                         <th className="px-2 py-2 font-bold w-[30%] border-l border-border/60 dark:border-dark-border/60">Address</th>
                         <th className="px-2 py-2 font-bold w-[9%] border-l border-border/60 dark:border-dark-border/60">Gender</th>
                         <th className="px-2 py-2 font-bold w-[11%] border-l border-border/60 dark:border-dark-border/60 text-center">Status</th>
                         <th className="px-2 py-2 font-bold w-[6%] border-l border-border/60 dark:border-dark-border/60 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredAppointments.map(apt => {
                          const patientUser = apt.patient?.user;
                          const name = patientUser ? `${patientUser.firstName} ${patientUser.lastName}` : '';
                          const isDependent = apt.notes?.includes('[DEPENDENT APPOINTMENT]');
                          const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes(VITALS_MARKER);
                          let displayName = name;
                          let displayPhone = patientUser?.phone || 'N/A';
                          let displayEmail = patientUser?.email || 'N/A';
                          let displayAddress = apt.patient?.address || 'N/A';
                          const displayGender = apt.patient?.gender || 'N/A';
                          
                          if (isDependent) {
                             const depMatch = apt.notes.match(/Dependent Name:\s*(.*)/);
                             if (depMatch) displayName = `${depMatch[1].trim()} (Dependent)`;
                          }

                          const d = new Date(apt.date);
                          let patientStatusLabel = apt.status;
                          if (apt.status === 'CONFIRMED' && hasVitalsMarker) {
                            patientStatusLabel = 'READY FOR CONSULTATION';
                          } else if (apt.status === 'CANCELLED') {
                            patientStatusLabel = (typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:')) ? 'REJECTED' : 'CANCELLED';
                          }

                          return (
                            <tr 
                              key={apt.id} 
                              onClick={() => openAppointmentDetails(apt)}
                              className="border-b border-border dark:border-dark-border hover:bg-surface-secondary/20 dark:hover:bg-dark-surface-tertiary/20 cursor-pointer group transition-colors"
                            >
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded flex items-center justify-center font-bold text-xs shrink-0">
                                    {(displayName?.[0] || 'P').toUpperCase()}
                                  </div>
                                  <span className="text-xs font-medium text-text-primary dark:text-dark-text-primary leading-tight break-words">{displayName}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2 border-l border-border/40 dark:border-dark-border/40">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary dark:text-dark-text-secondary font-medium leading-tight break-all">
                                    <Mail size={10} className="text-text-muted dark:text-dark-text-muted-dark shrink-0" />
                                    {displayEmail}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary dark:text-dark-text-secondary font-medium leading-tight break-all">
                                    <Phone size={10} className="text-text-muted dark:text-dark-text-muted-dark shrink-0" />
                                    {displayPhone}
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2 border-l border-border/40 dark:border-dark-border/40 text-[11px] text-text-secondary dark:text-dark-text-secondary font-medium leading-tight break-words">
                                {displayAddress}
                              </td>
                              <td className="px-2 py-2 border-l border-border/40 dark:border-dark-border/40 text-[11px] text-text-secondary dark:text-dark-text-secondary font-bold">{displayGender}</td>
                              <td className="px-2 py-2 border-l border-border/40 dark:border-dark-border/40 text-center">
                                <span className={`text-[9px] whitespace-nowrap font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                  apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                  apt.status === 'RESCHEDULED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>{patientStatusLabel}</span>
                              </td>
                              <td className="px-2 py-2 border-l border-border/40 dark:border-dark-border/40 text-right">
                                <div className="flex items-center justify-end">
                                  <div className="inline-flex items-center justify-center p-1.5 rounded-full text-text-muted dark:text-dark-text-muted-dark group-hover:text-primary dark:group-hover:text-dark-primary group-hover:bg-primary/10 dark:group-hover:bg-dark-primary/10 transition-colors">
                                    <ChevronRight size={16} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )
                       })}
                     </tbody>
                   </table>
                 </div>
              ) : user?.role === 'STAFF' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1080px]">
                    <thead>
                      <tr className="border-b border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted-dark text-xs uppercase tracking-wider">
                        <th className="px-3 py-2.5 font-bold">User</th>
                        <th className="px-3 py-2.5 font-bold border-l border-border/60 dark:border-dark-border/60">Contact Info</th>
                        <th className="px-3 py-2.5 font-bold border-l border-border/60 dark:border-dark-border/60">Address</th>
                        <th className="px-3 py-2.5 font-bold border-l border-border/60 dark:border-dark-border/60">Gender</th>
                        <th className="px-3 py-2.5 font-bold border-l border-border/60 dark:border-dark-border/60 text-center">Status</th>
                        <th className="px-3 py-2.5 font-bold border-l border-border/60 dark:border-dark-border/60 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => {
                        const patientUser = apt.patient?.user;
                        const patientName = patientUser
                          ? `${patientUser.firstName} ${patientUser.lastName}`
                          : 'Unknown Patient';
                        const contactEmail = patientUser?.email || 'N/A';
                        const contactPhone = patientUser?.phone || 'No phone number';
                        const address = apt.patient?.address || 'N/A';
                        const gender = apt.patient?.gender || 'N/A';

                        const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes(VITALS_MARKER);
                        let statusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
                        let statusLabel = apt.status;
                        
                        if (apt.status === 'CONFIRMED') {
                          statusLabel = hasVitalsMarker ? 'READY FOR CONSULTATION' : 'CONFIRMED';
                          statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                        } else if (apt.status === 'PENDING') {
                          statusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
                        } else if (apt.status === 'COMPLETED') {
                          statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                        } else if (apt.status === 'CANCELLED') {
                          statusLabel = (typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:')) ? 'REJECTED' : 'CANCELLED';
                          statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                        } else if (apt.status === 'RESCHEDULED') {
                          statusClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
                        }

                        return (
                          <tr key={apt.id} className="border-b border-border dark:border-dark-border hover:bg-surface-secondary/20 dark:hover:bg-dark-surface-tertiary/20 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-md flex items-center justify-center font-bold text-sm">
                                  {(patientUser?.firstName?.[0] || 'P').toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{patientName}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 border-l border-border/40 dark:border-dark-border/40">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                                  <Mail size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                                  {contactEmail}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                                  <Phone size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                                  {contactPhone}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 border-l border-border/40 dark:border-dark-border/40 text-sm text-text-secondary dark:text-dark-text-secondary">{address}</td>
                            <td className="p-4 border-l border-border/40 dark:border-dark-border/40 text-sm text-text-secondary dark:text-dark-text-secondary font-bold">{gender}</td>
                            <td className="p-4 border-l border-border/40 dark:border-dark-border/40 text-center">
                              <span className={`text-[10px] whitespace-nowrap font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="p-4 border-l border-border/40 dark:border-dark-border/40 text-right">
                              <button
                                onClick={() => openAppointmentDetails(apt)}
                                className="px-3 py-1.5 text-[11px] font-bold bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                              >
                                View Summary
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : user?.role === 'DOCTOR' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[920px]">
                    <thead>
                      <tr className="border-b border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted-dark text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">User</th>
                        <th className="p-4 font-bold border-l border-border/60 dark:border-dark-border/60">Contact Info</th>
                        <th className="p-4 font-bold border-l border-border/60 dark:border-dark-border/60">Address</th>
                        <th className="p-4 font-bold border-l border-border/60 dark:border-dark-border/60">Gender</th>
                        <th className="p-4 font-bold border-l border-border/60 dark:border-dark-border/60 text-center">Status</th>
                        <th className="p-4 font-bold border-l border-border/60 dark:border-dark-border/60 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => {
                        const patientUser = apt.patient?.user;
                        const patientName = patientUser
                          ? `${patientUser.firstName} ${patientUser.lastName}`
                          : 'Unknown Patient';
                        const contactEmail = patientUser?.email || 'N/A';
                        const contactPhone = patientUser?.phone || 'No phone number';
                        const address = apt.patient?.address || 'N/A';
                        const gender = apt.patient?.gender || 'N/A';
                        
                        const hasVitalsMarker = typeof apt.notes === 'string' && apt.notes.includes(VITALS_MARKER);
                        let doctorStatusLabel = apt.status;
                        let doctorStatusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
                        
                        if (apt.status === 'CONFIRMED') {
                          doctorStatusLabel = hasVitalsMarker ? 'READY' : 'WAITING';
                          doctorStatusClass = hasVitalsMarker 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                        } else if (apt.status === 'COMPLETED') {
                          doctorStatusLabel = 'COMPLETED';
                          doctorStatusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                        } else if (apt.status === 'CANCELLED') {
                          doctorStatusLabel = (typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:')) ? 'REJECTED' : 'CANCELLED';
                          doctorStatusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                        } else if (apt.status === 'PENDING') {
                          doctorStatusClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
                        } else if (apt.status === 'RESCHEDULED') {
                          doctorStatusClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
                        }

                        return (
                          <tr key={apt.id} className="border-b border-border dark:border-dark-border hover:bg-surface-secondary/20 dark:hover:bg-dark-surface-tertiary/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-md flex items-center justify-center font-bold text-sm">
                                  {(patientUser?.firstName?.[0] || 'P').toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{patientName}</span>
                              </div>
                            </td>
                            <td className="p-4 border-l border-border/40 dark:border-dark-border/40">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                                  <Mail size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                                  {contactEmail}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                                  <Phone size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                                  {contactPhone}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 border-l border-border/40 dark:border-dark-border/40 text-xs text-text-secondary dark:text-dark-text-secondary font-medium whitespace-nowrap">
                              {address}
                            </td>
                            <td className="px-3 py-2.5 border-l border-border/40 dark:border-dark-border/40 text-sm text-text-secondary dark:text-dark-text-secondary font-bold">{gender}</td>
                            <td className="px-3 py-2.5 border-l border-border/40 dark:border-dark-border/40 text-center">
                              <span className={`text-[10px] whitespace-nowrap font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${doctorStatusClass}`}>
                                {doctorStatusLabel}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 border-l border-border/40 dark:border-dark-border/40 text-right">
                              <button
                                onClick={() => openAppointmentDetails(apt)}
                                className="inline-flex items-center justify-center p-2 rounded-full text-text-muted dark:text-dark-text-muted-dark hover:text-primary dark:hover:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                                title="View Summary"
                                aria-label="View Summary"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                filteredAppointments.map((apt) => {
                  const d = new Date(apt.date);
                  const patientUser = apt.patient?.user;
                  const name = patientUser ? `${patientUser.firstName} ${patientUser.lastName}` : '';
                  return (
                    <div key={apt.id} className="flex gap-4 group justify-between items-start py-4 border-b border-border dark:border-dark-border last:border-none hover:bg-surface-secondary/20 dark:hover:bg-dark-surface-tertiary/20 rounded-md px-2 transition-colors">
                      <div className="flex gap-4 w-full">
                        <div className="w-14 h-14 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-lg flex flex-col items-center justify-center border border-border dark:border-dark-border group-hover:bg-primary/5 dark:group-hover:bg-dark-primary/10 transition-all shrink-0">
                          <span className="text-[10px] font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-tighter">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{d.getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-text-primary dark:text-dark-text-primary text-base truncate">{apt.reason || 'Appointment'}</h4>
                                <p className="text-sm text-text-secondary dark:text-dark-text-muted-dark font-medium mt-0.5">{apt.time}{name ? ` — ${name}` : ''}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                  apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                  apt.status === 'RESCHEDULED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>{apt.status === 'CANCELLED' && typeof apt.notes === 'string' && apt.notes.includes('REJECTION_REASON:') ? 'REJECTED' : apt.status}</span>
                                {user?.role === 'STAFF' && (
                                  <button
                                    onClick={() => openAppointmentDetails(apt)}
                                    className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="View Appointment"
                                  >
                                    <Eye size={15} />
                                  </button>
                                )}
                              </div>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between"> 
                             <div>
                                <span className="text-xs text-text-muted dark:text-dark-text-muted-dark">{d.getFullYear()}</span>
                             </div>

                             {/* Role Actions */}
                             <div className="flex gap-2">

   
                               {user?.role === 'STAFF' && (
                                 <button
                                  onClick={() => openAppointmentDetails(apt)}
                                  className="p-1.5 text-text-muted hover:text-primary dark:text-dark-text-muted-dark dark:hover:text-dark-primary transition-colors hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                               )}
                               <button
                                onClick={() => handlePrintSlip(apt)}
                                className="p-1.5 text-text-muted hover:text-primary dark:text-dark-text-muted-dark dark:hover:text-dark-primary transition-colors hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded"
                                title="Print Slip"
                              >
                                <Printer size={16} />
                              </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-md font-bold text-xs hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest shadow-md shadow-primary/20 focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none"
            >
              {showCalendar ? 'Hide Calendar' : 'View Full Calendar'}
            </button>
          </div>
      </div>

      {/* Full Calendar Grid */}
      {showCalendar && (
        <div className="mt-6 bg-white dark:bg-dark-surface-secondary rounded-lg border border-border dark:border-dark-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                else setCalendarMonth(calendarMonth - 1);
              }}
              className="p-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-md transition-colors border border-border dark:border-dark-border"
            >
              <ChevronLeft size={18} className="text-text-muted-dark dark:text-dark-text-muted-dark" />
            </button>
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
              {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                else setCalendarMonth(calendarMonth + 1);
              }}
              className="p-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-md transition-colors border border-border dark:border-dark-border"
            >
              <ChevronRight size={18} className="text-text-muted-dark dark:text-dark-text-muted-dark" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
            {(() => {
              const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
              const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
              const today = new Date();
              const cells = [];
              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`empty-${i}`} className="h-12" />);
              }
              for (let d = 1; d <= daysInMonth; d++) {
                const isToday = d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                const hasAppointment = myAppointments.some(a => {
                  const aDate = new Date(a.date);
                  return aDate.getFullYear() === calendarYear && aDate.getMonth() === calendarMonth && aDate.getDate() === d && a.status !== 'CANCELLED';
                });
                cells.push(
                  <div
                    key={d}
                    className={`h-12 flex items-center justify-center rounded-md text-sm font-bold cursor-pointer transition-all hover:bg-primary/10 dark:hover:bg-dark-primary/10 relative ${
                      isToday
                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/20'
                        : 'text-text-primary dark:text-dark-text-primary'
                    }`}
                  >
                    {d}
                    {hasAppointment && !isToday && <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary dark:bg-dark-primary rounded-full"></span>}
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.visible && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
            <div
              className="bg-white dark:bg-dark-surface-secondary w-full max-w-sm rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 p-6"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  confirmModal.actionType === 'delete' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  confirmModal.actionType === 'complete' ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' :
                  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {confirmModal.actionType === 'delete' ? <AlertCircle size={24} /> : <Check size={24} />}
                </div>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{confirmModal.title}</h3>
                <p className="text-text-muted dark:text-dark-text-muted-dark text-sm mb-6">{confirmModal.message}</p>



                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setConfirmModal({ ...confirmModal, visible: false })}
                    className="flex-1 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary rounded-md font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    className={`flex-1 py-3 text-white rounded-md font-bold text-sm hover:opacity-90 transition-opacity shadow-lg ${
                       confirmModal.actionType === 'delete' ? 'bg-red-600 shadow-red-600/30' : 
                       confirmModal.actionType === 'complete' ? 'bg-primary shadow-primary/30' :
                       'bg-green-600 shadow-green-600/30'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Nurse Reject Modal */}
      {rejectModal.visible && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div className="bg-white dark:bg-dark-surface-secondary w-full max-w-md rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 p-6" role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Reject Appointment</h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted-dark mt-1">Please provide the reason for rejection.</p>
              </div>
              <button
                onClick={() => setRejectModal({ visible: false, appointment: null, reason: '', loading: false })}
                className="p-2 rounded hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Reason (Required)</label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRejectModal({ visible: false, appointment: null, reason: '', loading: false })}
                className="flex-1 py-2.5 rounded-md bg-surface-secondary dark:bg-dark-surface-tertiary font-bold text-text-primary dark:text-dark-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={submitRejectAppointment}
                disabled={rejectModal.loading}
                className="flex-1 py-2.5 rounded-md bg-red-600 text-white font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {rejectModal.loading ? 'Submitting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Cancel Modal */}
      {cancelModal.visible && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div className="bg-white dark:bg-dark-surface-secondary w-full max-w-md rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 p-6" role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Cancel Appointment</h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted-dark mt-1">Please state the reason for canceling your appointment.</p>
              </div>
              <button
                onClick={() => setCancelModal({ visible: false, appointment: null, reason: '', loading: false })}
                className="p-2 rounded hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Reason (Required)</label>
            <textarea
              value={cancelModal.reason}
              onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter reason for cancellation..."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCancelModal({ visible: false, appointment: null, reason: '', loading: false })}
                className="flex-1 py-2.5 rounded-md bg-surface-secondary dark:bg-dark-surface-tertiary font-bold text-text-primary dark:text-dark-text-primary"
              >
                Back
              </button>
              <button
                onClick={submitCancelAppointment}
                disabled={cancelModal.loading}
                className="flex-1 py-2.5 rounded-md bg-red-600 text-white font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {cancelModal.loading ? 'Submitting...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nurse Vitals Modal */}
      {nurseVitalsModal.visible && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div className="bg-white dark:bg-dark-surface-secondary w-full max-w-2xl rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Patient Electronic Medical Record</h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted-dark mt-1">
                  Step {nurseVitalsModal.step} of 2: {nurseVitalsModal.step === 1 ? 'Vital Signs' : 'Summary'}
                </p>
              </div>
              <button
                onClick={() => setNurseVitalsModal({ visible: false, step: 1, appointment: null })}
                className="p-2 text-text-muted hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {nurseVitalsModal.step === 1 ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-text-primary dark:text-dark-text-primary">Vital Signs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Temperature (°C)</label>
                      <input value={nurseVitals.temperature} onChange={(e) => setNurseVitals(prev => ({ ...prev, temperature: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Blood Pressure</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Systolic" value={nurseVitals.systolic} onChange={(e) => setNurseVitals(prev => ({ ...prev, systolic: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                        <input placeholder="Diastolic" value={nurseVitals.diastolic} onChange={(e) => setNurseVitals(prev => ({ ...prev, diastolic: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Heart Rate (bpm)</label>
                      <input value={nurseVitals.heartRate} onChange={(e) => setNurseVitals(prev => ({ ...prev, heartRate: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Respiratory Rate</label>
                      <input value={nurseVitals.respiratoryRate} onChange={(e) => setNurseVitals(prev => ({ ...prev, respiratoryRate: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Oxygen Saturation (%)</label>
                      <input value={nurseVitals.oxygenSaturation} onChange={(e) => setNurseVitals(prev => ({ ...prev, oxygenSaturation: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Weight / Height</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Weight (kg)" value={nurseVitals.weight} onChange={(e) => setNurseVitals(prev => ({ ...prev, weight: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                        <input placeholder="Height (cm)" value={nurseVitals.height} onChange={(e) => setNurseVitals(prev => ({ ...prev, height: e.target.value }))} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Nurse Notes</label>
                      <textarea value={nurseVitals.notes} onChange={(e) => setNurseVitals(prev => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <h4 className="font-bold text-text-primary dark:text-dark-text-primary">Patient EMR Summary</h4>
                  <div className="rounded-md border border-border dark:border-dark-border p-4 bg-surface-secondary/40 dark:bg-dark-surface-tertiary/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Patient</span>
                        <p className="font-medium">{`${nurseVitalsModal.appointment?.patient?.user?.firstName || ''} ${nurseVitalsModal.appointment?.patient?.user?.lastName || ''}`.trim() || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Date & Time</span>
                        <p className="font-medium">{new Date(nurseVitalsModal.appointment?.date).toLocaleDateString()} at {nurseVitalsModal.appointment?.time}</p>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Reason for Visit</span>
                      <p className="font-medium whitespace-pre-wrap">{nurseVitalsModal.appointment?.reason || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border dark:border-dark-border">
                      <p><span className="font-bold">Temp:</span> {nurseVitals.temperature || 'N/A'} {nurseVitals.temperature ? '°C' : ''}</p>
                      <p><span className="font-bold">BP:</span> {(nurseVitals.systolic && nurseVitals.diastolic) ? `${nurseVitals.systolic}/${nurseVitals.diastolic}` : 'N/A'}</p>
                      <p><span className="font-bold">HR:</span> {nurseVitals.heartRate || 'N/A'}</p>
                      <p><span className="font-bold">RR:</span> {nurseVitals.respiratoryRate || 'N/A'}</p>
                      <p><span className="font-bold">SpO2:</span> {nurseVitals.oxygenSaturation || 'N/A'}</p>
                      <p><span className="font-bold">Weight:</span> {nurseVitals.weight || 'N/A'} {nurseVitals.weight ? 'kg' : ''}</p>
                      <p><span className="font-bold">Height:</span> {nurseVitals.height || 'N/A'} {nurseVitals.height ? 'cm' : ''}</p>
                    </div>
                    {nurseVitals.notes && (
                      <div className="pt-2 border-t border-border dark:border-dark-border">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Nurse Notes</span>
                        <p className="font-medium whitespace-pre-wrap">{nurseVitals.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border dark:border-dark-border flex justify-between">
              <button
                onClick={() => {
                  if (nurseVitalsModal.step === 1) {
                    setNurseVitalsModal({ visible: false, step: 1, appointment: null });
                    return;
                  }
                  setNurseVitalsModal((prev) => ({ ...prev, step: 1 }));
                }}
                className="px-5 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md font-bold text-sm text-text-primary dark:text-dark-text-primary hover:opacity-90"
              >
                Back
              </button>
              {nurseVitalsModal.step === 1 ? (
                <button
                  onClick={() => setNurseVitalsModal((prev) => ({ ...prev, step: 2 }))}
                  className="px-5 py-2.5 bg-primary text-white rounded-md font-bold text-sm shadow-lg shadow-primary/30 hover:opacity-90"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitNurseVitals}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-md font-bold text-sm shadow-lg shadow-green-600/30 hover:opacity-90"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

       {/* Book Appointment Modal */}
       {showBookModal && (
         <BookAppointmentModal 
            initialData={selectedViewAppointment ? {
              id: selectedViewAppointment.id,
              clinicType: selectedViewAppointment.type || 'Face-to-face',
              intakeForm: selectedViewAppointment.intakeForm,
              reasons: appointmentData.reasons,
             otherReason: appointmentData.otherReason,
             date: selectedViewAppointment.date.split('T')[0],
             time: selectedViewAppointment.time,
             notes: selectedViewAppointment.notes,
             reason: selectedViewAppointment.reason,
             patient: selectedViewAppointment.patient
           } : undefined}
           onBackToDetails={() => {
             setShowBookModal(false);
             setShowViewModal(true);
             setIsEditingAppointment(false);
           }}
           onClose={() => {
             setShowBookModal(false);
             setSelectedViewAppointment(null);
           }} 
           onSuccess={() => {
              setShowBookModal(false);
              setSelectedViewAppointment(null);
              fetchMyAppointments();
           }} 
        />
      )}

      {/* Patient View Appointment Modal */}
      {showViewModal && selectedViewAppointment && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
            <div
               className="bg-white dark:bg-dark-surface-secondary w-full max-w-lg rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden"
               role="dialog"
               aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border shrink-0 bg-primary/5 dark:bg-dark-primary/10 relative">
                 <div className="w-full text-center">
                    <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
                       {bookingType === 'myself' ? 'Appointment Details' : 'Appointment Details'}
                    </h3>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted-dark mt-1">
                       {new Date(selectedViewAppointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedViewAppointment.time}
                    </p>
                 </div>
                 <button
                    onClick={() => { setShowViewModal(false); setSelectedViewAppointment(null); setIsEditingAppointment(false); }}
                    className="absolute right-6 p-2 text-text-muted hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-md transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6">

                 {!isEditingAppointment && (
                    <div className="bg-surface-secondary/50 dark:bg-dark-surface-tertiary/30 p-6 rounded-lg border border-border dark:border-dark-border space-y-6">
                       <div className="flex items-center gap-3 pb-4 border-b border-border dark:border-dark-border">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                             <FileText size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-text-primary dark:text-dark-text-primary">Summary</h4>
                             <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">Check appointment details</p>
                          </div>
                       </div>
                       
                       {(() => {
                        const intakeRaw = selectedViewAppointment?.intakeForm;
                        let intake: any = intakeRaw;
                        if (typeof intakeRaw === 'string') {
                          try {
                            intake = JSON.parse(intakeRaw);
                          } catch {
                            intake = {};
                          }
                        }
                        if (!intake || typeof intake !== 'object') {
                          intake = {};
                        }
                        const profilePatient = selectedViewAppointment?.patient || {};
                        const profileUser = profilePatient?.user || {};
                        const patientInfo = intake?.patientInfo || {};
                        const patientName = patientInfo.name
                          || `${profileUser?.firstName || ''} ${profileUser?.lastName || ''}`.trim()
                          || (bookingType === 'myself' ? (user ? `${user.firstName} ${user.lastName}` : 'N/A') : dependentData.patientName || 'N/A');
                        const guardianName = patientInfo.guardianName || dependentData.guardianName || 'N/A';
                        const relation = patientInfo.relation || dependentData.relation || 'N/A';
                        const age = patientInfo.age
                          || calculateAgeFromDob(profilePatient?.dateOfBirth)
                          || 'N/A';
                        const sex = patientInfo.sex || patientInfo.gender || dependentData.gender || 'N/A';
                        const dob = patientInfo.dob
                          || (profilePatient?.dateOfBirth ? new Date(profilePatient.dateOfBirth).toLocaleDateString() : '')
                          || dependentData.dob
                          || 'N/A';
                        const contact = patientInfo.contact || profileUser?.phone || user?.phone || 'N/A';
                        const email = patientInfo.email || profileUser?.email || user?.email || 'N/A';
                        const address = patientInfo.address || profilePatient?.address || 'N/A';
                        const normalizeText = (value: any) => {
                          if (typeof value === 'string') return value.trim();
                          if (typeof value === 'number') return String(value);
                          return '';
                        };
                        const normalizeListLike = (value: any): string => {
                          if (Array.isArray(value)) {
                            return value
                              .map((v) => normalizeText(v))
                              .filter(Boolean)
                              .join(', ');
                          }
                          if (typeof value === 'string') {
                            return value.trim();
                          }
                          if (value && typeof value === 'object') {
                            const vals = Object.values(value)
                              .map((v) => normalizeText(v))
                              .filter(Boolean);
                            return vals.join(', ');
                          }
                          return '';
                        };

                        const reasonForVisit = normalizeListLike(intake?.reasons) || selectedViewAppointment.reason || 'N/A';
                        const symptomsRaw =
                          intake?.symptoms ??
                          intake?.currentSymptoms ??
                          intake?.chiefComplaintSymptoms ??
                          intake?.symptomList;
                        const symptoms = normalizeListLike(symptomsRaw) || 'None reported';

                        let medicalHistory = 'None recorded';
                        let allergy = profilePatient?.allergies || 'None reported';
                        let currentMeds = 'No';
                        const rawHistory = intake?.medicalHistory ?? intake?.history ?? intake?.pastMedicalHistory;
                        const rejectionMatch = typeof selectedViewAppointment?.notes === 'string'
                          ? selectedViewAppointment.notes.match(/REJECTION_REASON:\s*(.*)/)
                          : null;
                        const rejectionReason = rejectionMatch?.[1]?.trim();
                        const cancelMatch = typeof selectedViewAppointment?.notes === 'string'
                          ? selectedViewAppointment.notes.match(/CANCEL_REASON:\s*(.*)/)
                          : null;
                        const cancelReason = cancelMatch?.[1]?.trim();
                        const hasVitalsMarker = typeof selectedViewAppointment?.notes === 'string'
                          && selectedViewAppointment.notes.includes(VITALS_MARKER);
                        let summaryStatusLabel = selectedViewAppointment?.status || 'N/A';
                        if (summaryStatusLabel === 'CONFIRMED' && hasVitalsMarker) summaryStatusLabel = 'READY FOR CONSULTATION';
                        if (summaryStatusLabel === 'CANCELLED') {
                             summaryStatusLabel = (typeof selectedViewAppointment?.notes === 'string' && selectedViewAppointment.notes.includes('REJECTION_REASON:')) ? 'REJECTED' : 'CANCELLED';
                        }
                        const cleanNotes = typeof selectedViewAppointment?.notes === 'string'
                          ? selectedViewAppointment.notes
                              .split('\n')
                              .filter((line: string) => !line.includes(VITALS_MARKER) && !line.startsWith('REJECTION_REASON:') && !line.startsWith('CANCEL_REASON:'))
                              .join('\n')
                              .trim()
                          : '';

                        if (Array.isArray(rawHistory)) {
                          medicalHistory = rawHistory.length > 0 ? rawHistory.join(', ') : 'None recorded';
                        } else if (rawHistory && typeof rawHistory === 'object') {
                          const mh =
                            normalizeListLike(rawHistory.conditions) ||
                            normalizeListLike(rawHistory.illnesses) ||
                            normalizeText(rawHistory.illnessDetails);
                          if (mh) {
                            medicalHistory = mh;
                          } else if (rawHistory.illnessType === 'existing') {
                            medicalHistory = 'With existing illness';
                          } else if (rawHistory.illnessType === 'none') {
                            medicalHistory = 'No known illness';
                          }

                          allergy =
                            normalizeText(rawHistory.allergy) ||
                            normalizeText(rawHistory.allergies) ||
                            normalizeText(rawHistory.drugAllergies) ||
                            allergy ||
                            'None reported';

                          const medsValue =
                            rawHistory.currentMedications ??
                            rawHistory.currentMeds ??
                            rawHistory.takingMeds ??
                            rawHistory.medications;
                          const medsText = normalizeListLike(medsValue);
                          if (medsText) currentMeds = medsText;
                        } else if (typeof rawHistory === 'string' && rawHistory.trim()) {
                          medicalHistory = rawHistory;
                        }

                        if (allergy === 'None reported') {
                          const intakeAllergy =
                            normalizeText(intake?.allergy) ||
                            normalizeText(intake?.allergies) ||
                            normalizeText(intake?.drugAllergies);
                          if (intakeAllergy) allergy = intakeAllergy;
                        }

                        if (currentMeds === 'No') {
                          const medsFallback =
                            intake?.currentMedications ??
                            intake?.currentMeds ??
                            intake?.takingMeds ??
                            intake?.medications;
                          const medsText = normalizeListLike(medsFallback);
                          if (medsText) currentMeds = medsText;
                        }

                         return (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Patient Name</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary">{patientName}</span>
                              </div>
                              {bookingType === 'dependent' && (
                                <div>
                                   <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Guardian</span>
                                   <span className="font-medium text-text-primary dark:text-dark-text-primary">{guardianName} ({relation})</span>
                                </div>
                              )}
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Clinic Type</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary">{clinicType}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Date & Time</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary">{new Date(selectedViewAppointment.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {selectedViewAppointment.time}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Status</span>
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                    summaryStatusLabel === 'COMPLETED' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' :
                                    summaryStatusLabel === 'RESCHEDULED' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' :
                                    summaryStatusLabel === 'REJECTED' || summaryStatusLabel === 'CANCELLED' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' :
                                    summaryStatusLabel === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 ring-2 ring-emerald-500/20 animate-pulse' :
                                    'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30'
                                 }`}>
                                    {summaryStatusLabel}
                                 </span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Age / Sex</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary">{age} / {sex}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Date of Birth</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary">{dob}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Contact</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary">{contact}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Email</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary break-all">{email}</span>
                              </div>
                              <div className="md:col-span-2">
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Address</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{address}</span>
                              </div>
                              <div className="md:col-span-2">
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Reason for Visit</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{reasonForVisit}</span>
                              </div>
                              <div className="md:col-span-2">
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Current Symptoms</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{symptoms}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Medical History</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{medicalHistory}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Allergy</span>
                                 <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{allergy}</span>
                              </div>
                             <div>
                                <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Current Medications</span>
                                <span className="font-medium text-text-primary dark:text-dark-text-primary">{currentMeds}</span>
                              </div>
                              {user?.role !== 'STAFF' && selectedViewAppointment.latestVitalSign && (
                                <>
                                  <div className="md:col-span-2 mt-2 pt-4 border-t border-border dark:border-dark-border">
                                    <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-2">Vital Signs</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                      <span><strong>Temp:</strong> {selectedViewAppointment.latestVitalSign.temperature || 'N/A'}</span>
                                      <span><strong>BP:</strong> {selectedViewAppointment.latestVitalSign.bloodPressure || 'N/A'}</span>
                                      <span><strong>HR:</strong> {selectedViewAppointment.latestVitalSign.heartRate || 'N/A'}</span>
                                      <span><strong>RR:</strong> {selectedViewAppointment.latestVitalSign.respiratoryRate || 'N/A'}</span>
                                      <span><strong>SpO2:</strong> {selectedViewAppointment.latestVitalSign.oxygenSaturation || 'N/A'}</span>
                                      <span><strong>Wt/Ht:</strong> {selectedViewAppointment.latestVitalSign.weight || 'N/A'} / {selectedViewAppointment.latestVitalSign.height || 'N/A'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Nurse Name</span>
                                    <span className="font-medium text-text-primary dark:text-dark-text-primary">
                                    {(() => {
                                      const nurseObj = selectedViewAppointment.latestVitalSign.recordedBy?.user || selectedViewAppointment.latestVitalSign.recordedBy;
                                      return nurseObj ? `${nurseObj.firstName || ''} ${nurseObj.lastName || ''}`.trim() || 'N/A' : 'N/A';
                                    })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Date Signed</span>
                                    <span className="font-medium text-text-primary dark:text-dark-text-primary">
                                      {selectedViewAppointment.latestVitalSign.recordedAt
                                        ? new Date(selectedViewAppointment.latestVitalSign.recordedAt).toLocaleString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </>
                              )}
                              {user?.role === 'STAFF' && selectedViewAppointment.latestVitalSign && (
                                <>
                                  <div className="md:col-span-2 mt-2 pt-4 border-t border-border dark:border-dark-border">
                                    <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-2">Vital Signs</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                      <span><strong>Temp:</strong> {selectedViewAppointment.latestVitalSign.temperature || 'N/A'}</span>
                                      <span><strong>BP:</strong> {selectedViewAppointment.latestVitalSign.bloodPressure || 'N/A'}</span>
                                      <span><strong>HR:</strong> {selectedViewAppointment.latestVitalSign.heartRate || 'N/A'}</span>
                                      <span><strong>RR:</strong> {selectedViewAppointment.latestVitalSign.respiratoryRate || 'N/A'}</span>
                                      <span><strong>SpO2:</strong> {selectedViewAppointment.latestVitalSign.oxygenSaturation || 'N/A'}</span>
                                      <span><strong>Wt/Ht:</strong> {selectedViewAppointment.latestVitalSign.weight || 'N/A'} / {selectedViewAppointment.latestVitalSign.height || 'N/A'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Nurse Name</span>
                                    <span className="font-medium text-text-primary dark:text-dark-text-primary">
                                      {(() => {
                                        const nurseObj = selectedViewAppointment.latestVitalSign.recordedBy?.user || selectedViewAppointment.latestVitalSign.recordedBy;
                                        return nurseObj ? `${nurseObj.firstName || ''} ${nurseObj.lastName || ''}`.trim() || 'N/A' : (user ? `${user.firstName} ${user.lastName}` : 'N/A');
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Date Signed</span>
                                    <span className="font-medium text-text-primary dark:text-dark-text-primary">
                                      {selectedViewAppointment.latestVitalSign.recordedAt
                                        ? new Date(selectedViewAppointment.latestVitalSign.recordedAt).toLocaleString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </>
                              )}
                              {cleanNotes && cleanNotes !== 'None' && (
                                <div className="md:col-span-2 mt-2 pt-4 border-t border-border dark:border-dark-border">
                                   <span className="block text-[10px] font-bold text-text-muted-dark uppercase tracking-wider mb-1">Additional Notes</span>
                                   <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{cleanNotes}</span>
                                </div>
                              )}
                              {selectedViewAppointment.status === 'CANCELLED' && rejectionReason && (
                                <div className="md:col-span-2 mt-2 pt-4 border-t border-border dark:border-dark-border">
                                  <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Rejection Reason</span>
                                  <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{rejectionReason}</span>
                                </div>
                              )}
                              {selectedViewAppointment.status === 'CANCELLED' && cancelReason && (
                                <div className="md:col-span-2 mt-2 pt-4 border-t border-border dark:border-dark-border bg-red-50/50 p-4 rounded-md">
                                  <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Cancellation Reason</span>
                                  <span className="font-medium text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">{cancelReason}</span>
                                </div>
                              )}
                              
                              {/* Form Print Actions */}
                              {(selectedViewAppointment?.intakeForm || selectedViewAppointment?.consultationForm) && (
                                <div className="md:col-span-2 flex gap-4 pt-4 border-t border-border dark:border-dark-border no-print">
                                   {selectedViewAppointment.intakeForm && (
                                      <button
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            setPrintData({ visible: true, type: 'intake', appointment: selectedViewAppointment });
                                         }}
                                         className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                                      >
                                         <Printer size={14} /> Print Intake Form
                                      </button>
                                   )}
                                   {selectedViewAppointment.consultationForm && (
                                      <button
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            setPrintData({ visible: true, type: 'consultation', appointment: selectedViewAppointment });
                                         }}
                                         className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline"
                                      >
                                         <Printer size={14} /> Print Consultation Note
                                      </button>
                                   )}
                                </div>
                              )}
                           </div>
                         );
                       })()}
                    </div>
                  )}

                  {/* Intake Form Data */}
                  {selectedViewAppointment?.intakeForm && (
                     <div className="bg-primary/5 dark:bg-dark-primary/5 p-6 rounded-lg border border-primary/20 dark:border-dark-primary/20 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-primary/10 dark:border-dark-primary/10">
                           <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <ClipboardList size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-text-primary dark:text-dark-text-primary">Patient Intake Form</h4>
                              <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">Pre-appointment health assessment</p>
                           </div>
                        </div>

                        {(() => {
                          const intake = selectedViewAppointment.intakeForm || {};
                          const emergency = intake.emergencyContact || {};
                          const lifestyle = intake.lifestyle || {};
                          const rawHistory = intake.medicalHistory;
                          const medicalList = Array.isArray(rawHistory)
                            ? rawHistory
                            : (rawHistory && typeof rawHistory === 'object')
                              ? [
                                  rawHistory.illnessType === 'existing'
                                    ? (rawHistory.illnessDetails || 'With existing illness')
                                    : 'No known illness'
                                ]
                              : [];

                          return (
                            <div className="space-y-6 text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Emergency Contact</span>
                                  <p className="font-medium text-text-primary dark:text-dark-text-primary">
                                    {emergency.name ? `${emergency.name} (${emergency.relation || 'N/A'})` : 'Not provided'}
                                  </p>
                                  <p className="text-xs text-text-muted">{emergency.phone || ''}</p>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Physical Activity</span>
                                  <p className="font-medium text-text-primary dark:text-dark-text-primary">{lifestyle.exercise || 'Not specified'}</p>
                                </div>
                              </div>

                              <div>
                                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Past Medical History</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {medicalList.length > 0 ? (
                                    medicalList.map((c: string) => (
                                      <span key={c} className="px-2 py-1 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-sm text-xs font-medium border border-border dark:border-dark-border">{c}</span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-text-muted">None recorded</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-6">
                                <div>
                                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Smoking</span>
                                  <p className="font-bold text-xs uppercase text-text-primary dark:text-dark-text-primary">{lifestyle.smoking ? 'YES' : 'NO'}</p>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Alcohol</span>
                                  <p className="font-bold text-xs uppercase text-text-primary dark:text-dark-text-primary">{lifestyle.alcohol ? 'YES' : 'NO'}</p>
                                </div>
                              </div>

                              {intake.symptoms && (
                                <div className="pt-4 border-t border-primary/10">
                                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Symptoms Description</span>
                                  <p className="font-medium whitespace-pre-wrap text-text-primary dark:text-dark-text-primary">{intake.symptoms}</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                     </div>
                  )}

                  {/* Consultation Data (If completed) */}
                  {selectedViewAppointment?.consultationForm && (
                     <div className="bg-emerald-50/50 dark:bg-emerald-900/5 p-6 rounded-lg border border-emerald-100 dark:border-emerald-900/20 space-y-6">
                         <div className="flex items-center gap-3 pb-4 border-b border-emerald-100 dark:border-emerald-900/10">
                           <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Check size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-emerald-900 dark:text-emerald-400">Consultation Findings</h4>
                              <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Completed by Physician</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                           <div>
                              <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider mb-1">Assessment (Diagnosis)</span>
                              <p className="font-bold text-emerald-900 dark:text-emerald-300">{selectedViewAppointment.consultationForm.assessment}</p>
                           </div>
                           <div>
                              <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider mb-1">Plan (Treatment)</span>
                              <p className="font-medium text-emerald-900 dark:text-emerald-300">{selectedViewAppointment.consultationForm.plan}</p>
                           </div>
                        </div>
                     </div>
                  )}


              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-border dark:border-dark-border shrink-0 flex flex-wrap gap-3 justify-end bg-surface-secondary/30 dark:bg-dark-surface-tertiary/10 rounded-b-2xl">
                  {user?.role === 'PATIENT' && ['PENDING', 'RESCHEDULED'].includes(selectedViewAppointment.status) && (
                     <button
                        onClick={() => {
                           setShowViewModal(false);
                           openCancelModal(selectedViewAppointment);
                        }}
                        className="px-6 py-2.5 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-md hover:bg-red-100 transition-colors"
                     >
                        Cancel Appointment
                     </button>
                  )}
                  {user?.role === 'PATIENT' && selectedViewAppointment.status === 'COMPLETED' && (
                     <button
                        onClick={() => {
                           setShowViewModal(false);
                           navigate('/medical-records');
                        }}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-md shadow-lg shadow-blue-600/30 hover:opacity-90 transition-opacity"
                     >
                        View Records
                     </button>
                  )}
                  {user?.role === 'STAFF' && selectedViewAppointment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => openRejectModal(selectedViewAppointment)}
                        className="px-6 py-2.5 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-md hover:bg-red-100 transition-colors"
                      >
                        Reject Appointment
                      </button>
                      <button
                        onClick={() => handleNurseConfirmAppointment(selectedViewAppointment)}
                        className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-md shadow-lg shadow-green-600/30 hover:opacity-90 transition-opacity"
                      >
                        Confirm Appointment
                      </button>
                    </>
                  )}
                  {user?.role === 'STAFF' && selectedViewAppointment.status === 'CONFIRMED' && !selectedViewAppointment.latestVitalSign && (
                    <button
                      onClick={() => {
                        resetNurseVitals();
                        setShowViewModal(false);
                        setNurseVitalsModal({
                          visible: true,
                          step: 1,
                          appointment: selectedViewAppointment
                        });
                      }}
                      className="px-6 py-2.5 bg-primary text-white font-bold rounded-md shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
                    >
                      Record Vital Signs
                    </button>
                  )}
                  {selectedViewAppointment.status === 'CONFIRMED' && user?.role === 'DOCTOR' && (
                     <button
                        onClick={() => {
                           setShowViewModal(false);
                           setShowConsultationModal(true);
                        }}
                        className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-md shadow-lg shadow-emerald-600/30 hover:opacity-90 transition-opacity"
                     >
                        Start Consultation
                     </button>
                  )}
                  {user?.role === 'PATIENT' && ['PENDING', 'RESCHEDULED'].includes(selectedViewAppointment.status) && (
                     <button
                        onClick={() => {
                           setShowViewModal(false);
                           setShowBookModal(true);
                        }}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-md shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
                     >
                        Edit Details
                     </button>
                  )}
              </div>
            </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsultationModal && selectedViewAppointment && (
         <ConsultationFormModal 
            appointment={selectedViewAppointment}
            onClose={() => setShowConsultationModal(false)}
            onSuccess={() => {
               fetchMyAppointments();
            }}
         />
      )}

      {/* Print View Overlay */}
      {printData.visible && printData.appointment && (
         <div className="fixed inset-0 z-[130] bg-white dark:bg-dark-surface-primary overflow-y-auto">
            <div className="p-4 no-print flex justify-end">
               <button 
                  onClick={() => setPrintData({ ...printData, visible: false })}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-tertiary rounded-full"
               >
                  <X size={24} className="text-text-primary dark:text-dark-text-primary" />
               </button>
            </div>
            
            <PrintableForm 
               title={printData.type === 'intake' ? 'Patient Intake Form' : 'Consultation Findings'}
               subtitle={printData.type === 'intake' ? 'Patient Self-Assessment' : 'Medical SOAP Notes'}
               patientInfo={{
                  name: `${printData.appointment.patient?.user?.firstName} ${printData.appointment.patient?.user?.lastName}`,
                  dob: printData.appointment.patient?.dateOfBirth,
                  gender: printData.appointment.patient?.gender,
                  phone: printData.appointment.patient?.user?.phone
               }}
            >
               {printData.type === 'intake' ? (
                  <div className="space-y-6">
                     <section>
                        <h3 className="text-sm font-black uppercase text-gray-400 border-b mb-4">Symptoms Description</h3>
                        <p className="text-lg font-medium whitespace-pre-wrap">{printData.appointment.intakeForm.symptoms || 'None reported.'}</p>
                     </section>
                     <div className="grid grid-cols-2 gap-10">
                        <section>
                           <h3 className="text-sm font-black uppercase text-gray-400 border-b mb-4">Medical History</h3>
                           <ul className="list-disc pl-5 space-y-1">
                              {printData.appointment.intakeForm.medicalHistory.map((h: string) => <li key={h} className="font-bold">{h}</li>)}
                              {printData.appointment.intakeForm.medicalHistory.length === 0 && <li className="font-bold">None recorded</li>}
                           </ul>
                        </section>
                        <section>
                           <h3 className="text-sm font-black uppercase text-gray-400 border-b mb-4">Lifestyle</h3>
                           <p className="font-bold text-sm">Smoking: {printData.appointment.intakeForm.lifestyle.smoking ? 'Yes' : 'No'}</p>
                           <p className="font-bold text-sm">Alcohol: {printData.appointment.intakeForm.lifestyle.alcohol ? 'Yes' : 'No'}</p>
                           <p className="font-bold text-sm">Activity: {printData.appointment.intakeForm.lifestyle.exercise}</p>
                        </section>
                     </div>
                     <section>
                        <h3 className="text-sm font-black uppercase text-gray-400 border-b mb-4">Reason for Visit (Booking)</h3>
                        <p className="font-bold text-lg">{printData.appointment.reason}</p>
                     </section>
                  </div>
               ) : (
                  (() => {
                    const cf = printData.appointment.consultationForm || {};
                    const exam = cf.physicalExam || {};
                    const ap = cf.assessmentPlan || {};
                    const meds = Array.isArray(ap.medications) ? ap.medications : [];
                    const impressions = Array.isArray(ap.impressions) ? ap.impressions : [];

                    return (
                      <div className="space-y-4">
                        <h3 className="text-center text-xl font-black">PATIENT EMR SUMMARY</h3>

                        <section className="border p-3">
                          <h4 className="font-black">Clinic & Visit</h4>
                          <p>Clinic Name: Barangay Health Clinic</p>
                          <p>Date & Time: {new Date(printData.appointment.date).toLocaleDateString()} {printData.appointment.time}</p>
                          <p>Visit Type: [ New / Follow-up ]</p>
                        </section>

                        <section className="border p-3">
                          <h4 className="font-black">Physical Examination (Doctor Input)</h4>
                          <p>Heart: {exam.heart || 'N/A'}</p>
                          <p>Abdomen: {exam.abdomen || 'N/A'}</p>
                          <p>Skin: {exam.skin || 'N/A'}</p>
                          <p>Notes: {exam.notes || 'N/A'}</p>
                        </section>

                        <section className="border p-3">
                          <h4 className="font-black">Assessment / Impression (Doctor Input)</h4>
                          <p className="whitespace-pre-wrap">{impressions.join('\n') || cf.assessment || 'N/A'}</p>
                          <p>Final Diagnosis: {ap.finalDiagnosis || cf.assessment || 'N/A'}</p>
                        </section>

                        <section className="border p-3">
                          <h4 className="font-black">Plan (Doctor Input)</h4>
                          <p>Follow-up Date: [ {ap.followUpDate || '--'} ]</p>
                          <p>Plan: {cf.plan || 'N/A'}</p>
                        </section>

                        <section className="border p-3">
                          <h4 className="font-black">Medication Prescription</h4>
                          <table className="w-full mt-2 text-left text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="py-1">Drug</th>
                                <th className="py-1">Dose</th>
                                <th className="py-1">Frequency</th>
                                <th className="py-1">Days</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meds.length > 0 ? meds.map((m: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-1">{m.drug || '-'}</td>
                                  <td className="py-1">{m.dose || '-'}</td>
                                  <td className="py-1">{m.frequency || '-'}</td>
                                  <td className="py-1">{m.days || '-'}</td>
                                </tr>
                              )) : (
                                <tr><td className="py-1" colSpan={4}>No medication entries</td></tr>
                              )}
                            </tbody>
                          </table>
                        </section>
                      </div>
                    );
                  })()
               )}
            </PrintableForm>
         </div>
      )}

    </DashboardLayout>
  );
};

export default Appointments;
