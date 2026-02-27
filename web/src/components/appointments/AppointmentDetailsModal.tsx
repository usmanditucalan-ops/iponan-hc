import { useState } from 'react';
import { X, FileText, ClipboardList, Printer, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PrintableForm } from '../common/PrintableForm';

interface AppointmentDetailsModalProps {
  appointment: any;
  onClose: () => void;
  onEditDetails?: () => void;
  onCancelAppointment?: () => void;
}

export const AppointmentDetailsModal = ({
  appointment: selectedViewAppointment,
  onClose,
  onEditDetails,
  onCancelAppointment
}: AppointmentDetailsModalProps) => {
  const { user } = useAuth();
  const [printData, setPrintData] = useState<{ visible: boolean; type: 'intake' | 'consultation'; appointment: any }>({
    visible: false,
    type: 'intake',
    appointment: null
  });

  if (!selectedViewAppointment) return null;

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

  const isDependent = selectedViewAppointment.notes?.includes('[DEPENDENT APPOINTMENT]');
  let bookingType = 'myself';
  let dependentData = { guardianName: '', relation: '', patientName: '', dob: '', gender: 'MALE' };

  if (isDependent) {
    bookingType = 'dependent';
    const nameMatch = selectedViewAppointment.notes.match(/Dependent Name:\s*(.*)/);
    const dobMatch = selectedViewAppointment.notes.match(/DOB:\s*(.*)/);
    const genderMatch = selectedViewAppointment.notes.match(/Gender:\s*(.*)/);
    const guardMatch = selectedViewAppointment.notes.match(/Guardian:\s*(.*)/);
    const relMatch = selectedViewAppointment.notes.match(/Relation:\s*(.*)/);
    dependentData = {
      patientName: nameMatch ? nameMatch[1].trim() : '',
      dob: dobMatch ? dobMatch[1].trim() : '',
      gender: genderMatch ? genderMatch[1].trim() : 'MALE',
      guardianName: guardMatch ? guardMatch[1].trim() : '',
      relation: relMatch ? relMatch[1].trim() : ''
    };
  }

  let rawReason = selectedViewAppointment.reason || '';
  const clinicMatch = rawReason.match(/^\[(.*?)\]\s*(.*)/);
  let clinicType = 'General Consultation - Barangay Health Clinic';
  if (clinicMatch) {
    clinicType = clinicMatch[1].trim();
  }

  return (
    <>
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
        <div className="bg-white dark:bg-dark-surface-secondary w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border shrink-0 bg-primary/5 dark:bg-dark-primary/10 relative">
            <div className="w-full text-center">
              <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
                Appointment Details
              </h3>
              <p className="text-sm text-text-muted dark:text-dark-text-muted-dark mt-1">
                {new Date(selectedViewAppointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedViewAppointment.time}
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-6 p-2 text-text-muted hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="bg-surface-secondary/50 dark:bg-dark-surface-tertiary/30 p-6 rounded-2xl border border-border dark:border-dark-border space-y-6">
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
                  try { intake = JSON.parse(intakeRaw); } catch { intake = {}; }
                }
                if (!intake || typeof intake !== 'object') intake = {};
                
                const profilePatient = selectedViewAppointment?.patient || {};
                const profileUser = profilePatient?.user || {};
                const patientInfo = intake?.patientInfo || {};
                const patientName = patientInfo.name
                  || `${profileUser?.firstName || ''} ${profileUser?.lastName || ''}`.trim()
                  || (bookingType === 'myself' ? (user ? `${user.firstName} ${user.lastName}` : 'N/A') : dependentData.patientName || 'N/A');
                const guardianName = patientInfo.guardianName || dependentData.guardianName || 'N/A';
                const relation = patientInfo.relation || dependentData.relation || 'N/A';
                const age = patientInfo.age || calculateAgeFromDob(profilePatient?.dateOfBirth) || 'N/A';
                const sex = patientInfo.sex || patientInfo.gender || dependentData.gender || 'N/A';
                const dob = patientInfo.dob
                  || (profilePatient?.dateOfBirth ? new Date(profilePatient.dateOfBirth).toLocaleDateString() : '')
                  || dependentData.dob || 'N/A';
                const contact = patientInfo.contact || profileUser?.phone || user?.phone || 'N/A';
                const email = patientInfo.email || profileUser?.email || user?.email || 'N/A';
                const address = patientInfo.address || profilePatient?.address || 'N/A';
                
                const normalizeText = (value: any) => {
                  if (typeof value === 'string') return value.trim();
                  if (typeof value === 'number') return String(value);
                  return '';
                };
                const normalizeListLike = (value: any): string => {
                  if (Array.isArray(value)) return value.map(v => normalizeText(v)).filter(Boolean).join(', ');
                  if (typeof value === 'string') return value.trim();
                  if (value && typeof value === 'object') return Object.values(value).map(v => normalizeText(v)).filter(Boolean).join(', ');
                  return '';
                };

                const reasonForVisit = normalizeListLike(intake?.reasons) || selectedViewAppointment.reason || 'N/A';
                const symptomsRaw = intake?.symptoms ?? intake?.currentSymptoms ?? intake?.chiefComplaintSymptoms ?? intake?.symptomList;
                const symptoms = normalizeListLike(symptomsRaw) || 'None reported';

                let medicalHistory = 'None recorded';
                let allergy = profilePatient?.allergies || 'None reported';
                let currentMeds = 'No';
                const rawHistory = intake?.medicalHistory ?? intake?.history ?? intake?.pastMedicalHistory;
                const rejectionMatch = typeof selectedViewAppointment?.notes === 'string' ? selectedViewAppointment.notes.match(/REJECTION_REASON:\s*(.*)/) : null;
                const rejectionReason = rejectionMatch?.[1]?.trim();
                const hasVitalsMarker = typeof selectedViewAppointment?.notes === 'string' && selectedViewAppointment.notes.includes(VITALS_MARKER);
                let summaryStatusLabel = selectedViewAppointment?.status || 'N/A';
                if (summaryStatusLabel === 'CONFIRMED' && hasVitalsMarker) summaryStatusLabel = 'READY FOR CONSULTATION';
                if (summaryStatusLabel === 'CANCELLED') summaryStatusLabel = 'REJECTED';
                const cleanNotes = typeof selectedViewAppointment?.notes === 'string'
                  ? selectedViewAppointment.notes.split('\n').filter((line: string) => !line.includes(VITALS_MARKER) && !line.startsWith('REJECTION_REASON:')).join('\n').trim()
                  : '';

                if (Array.isArray(rawHistory)) {
                  medicalHistory = rawHistory.length > 0 ? rawHistory.join(', ') : 'None recorded';
                } else if (rawHistory && typeof rawHistory === 'object') {
                  const mh = normalizeListLike(rawHistory.conditions) || normalizeListLike(rawHistory.illnesses) || normalizeText(rawHistory.illnessDetails);
                  if (mh) medicalHistory = mh;
                  else if (rawHistory.illnessType === 'existing') medicalHistory = 'With existing illness';
                  else if (rawHistory.illnessType === 'none') medicalHistory = 'No known illness';

                  allergy = normalizeText(rawHistory.allergy) || normalizeText(rawHistory.allergies) || normalizeText(rawHistory.drugAllergies) || allergy || 'None reported';
                  const medsValue = rawHistory.currentMedications ?? rawHistory.currentMeds ?? rawHistory.takingMeds ?? rawHistory.medications;
                  const medsText = normalizeListLike(medsValue);
                  if (medsText) currentMeds = medsText;
                } else if (typeof rawHistory === 'string' && rawHistory.trim()) {
                  medicalHistory = rawHistory;
                }

                if (allergy === 'None reported') {
                  const intakeAllergy = normalizeText(intake?.allergy) || normalizeText(intake?.allergies) || normalizeText(intake?.drugAllergies);
                  if (intakeAllergy) allergy = intakeAllergy;
                }

                if (currentMeds === 'No') {
                  const medsFallback = intake?.currentMedications ?? intake?.currentMeds ?? intake?.takingMeds ?? intake?.medications;
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
                      <span className="font-medium text-text-primary dark:text-dark-text-primary">{summaryStatusLabel}</span>
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

            {/* Intake Form Data */}
            {selectedViewAppointment?.intakeForm && (
              <div className="bg-primary/5 dark:bg-dark-primary/5 p-6 rounded-2xl border border-primary/20 dark:border-dark-primary/20 space-y-6">
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
                      ? [rawHistory.illnessType === 'existing' ? (rawHistory.illnessDetails || 'With existing illness') : 'No known illness']
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
                              <span key={c} className="px-2 py-1 bg-surface-secondary dark:bg-dark-surface-tertiary rounded text-xs font-medium border border-border dark:border-dark-border">{c}</span>
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
              <div className="bg-emerald-50/50 dark:bg-emerald-900/5 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 space-y-6">
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
          <div className="p-6 border-t border-border dark:border-dark-border shrink-0 flex flex-wrap gap-3 justify-end bg-surface-secondary/30 dark:bg-dark-surface-tertiary/10 rounded-b-3xl">
            {user?.role === 'PATIENT' && ['PENDING', 'RESCHEDULED'].includes(selectedViewAppointment.status) && (
              <button
                onClick={onCancelAppointment}
                className="px-6 py-2.5 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 transition-colors"
              >
                Cancel Appointment
              </button>
            )}
            {user?.role === 'PATIENT' && ['PENDING', 'RESCHEDULED'].includes(selectedViewAppointment.status) && onEditDetails && (
              <button
                onClick={onEditDetails}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>

      {printData.visible && printData.appointment && (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-dark-surface-primary overflow-y-auto">
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
                  <p className="text-lg font-medium whitespace-pre-wrap">{printData.appointment.intakeForm?.symptoms || 'None reported.'}</p>
                </section>
                <div className="grid grid-cols-2 gap-10">
                  <section>
                    <h3 className="text-sm font-black uppercase text-gray-400 border-b mb-4">Medical History</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(printData.appointment.intakeForm?.medicalHistory) ? 
                        printData.appointment.intakeForm.medicalHistory.map((h: string) => <li key={h} className="font-bold">{h}</li>) : 
                        <li className="font-bold">None recorded</li>
                      }
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-black uppercase text-gray-400 border-b mb-4">Lifestyle</h3>
                    <p className="font-bold text-sm">Smoking: {printData.appointment.intakeForm?.lifestyle?.smoking ? 'Yes' : 'No'}</p>
                    <p className="font-bold text-sm">Alcohol: {printData.appointment.intakeForm?.lifestyle?.alcohol ? 'Yes' : 'No'}</p>
                    <p className="font-bold text-sm">Activity: {printData.appointment.intakeForm?.lifestyle?.exercise || 'N/A'}</p>
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

                return (
                  <div className="space-y-4">
                    <h3 className="text-center text-xl font-black">PATIENT EMR SUMMARY</h3>

                    <section className="border p-3">
                      <h4 className="font-black">Clinic & Visit</h4>
                      <p> <span className="font-semibold">Clinic Name:</span> Barangay Health Clinic</p>
                      <p> <span className="font-semibold">Date & Time:</span> {new Date(printData.appointment.date).toLocaleDateString()} {printData.appointment.time}</p>
                    </section>

                    <section className="border p-3">
                      <h4 className="font-black">Physical Examination (Doctor Input)</h4>
                      <p><span className="font-semibold">Heart:</span> {exam.heart || 'N/A'}</p>
                      <p><span className="font-semibold">Abdomen:</span> {exam.abdomen || 'N/A'}</p>
                      <p><span className="font-semibold">Skin:</span> {exam.skin || 'N/A'}</p>
                      <p><span className="font-semibold">Notes:</span> {exam.notes || 'N/A'}</p>
                    </section>

                    <section className="border p-3">
                      <h4 className="font-black">Assessment / Impression (Doctor Input)</h4>
                      <p><span className="font-semibold">Diagnosis:</span> {cf.assessment || 'N/A'}</p>
                      <p><span className="font-semibold">Plan:</span> {cf.plan || 'N/A'}</p>
                    </section>
                  </div>
                );
              })()
            )}
          </PrintableForm>
        </div>
      )}
    </>
  );
};
