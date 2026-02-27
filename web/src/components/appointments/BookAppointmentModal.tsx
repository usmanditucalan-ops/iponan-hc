import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, User, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import api from '../../services/api';

interface BookAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onBackToDetails?: () => void;
  initialData?: any;
}

export const BookAppointmentModal = ({ onClose, onSuccess, onBackToDetails, initialData }: BookAppointmentModalProps) => {
  const { user } = useAuth();
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(initialData?.id ? 2 : 1);

  // Patient Profile ID
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);

  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data?.user?.patient?.id) {
          setPatientId(res.data.user.patient.id);
          setPatientProfile(res.data.user.patient);
        }
      } catch {
        console.error('Failed to fetch patient profile');
      }
    };
    fetchPatientId();
  }, []);

  // Form State
  const [bookingType, setBookingType] = useState<'myself' | 'dependent'>(initialData?.bookingType || 'myself');
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    sex: 'Male',
    dob: '',
    address: '',
    contact: '',
    email: '',
    guardianName: user ? `${user.firstName} ${user.lastName}` : '',
    relation: ''
  });

  // Auto-fill for 'myself'
  useEffect(() => {
    if (initialData?.id && initialData?.intakeForm?.patientInfo) {
      return;
    }
    if (bookingType === 'myself' && user) {
      setPatientData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contact: user.phone || '',
        dob: patientProfile?.dateOfBirth ? new Date(patientProfile.dateOfBirth).toISOString().split('T')[0] : '',
        sex: patientProfile?.gender === 'FEMALE' ? 'Female' : 'Male',
        address: patientProfile?.address || ''
      }));
    }
  }, [bookingType, user, patientProfile, initialData]);

  useEffect(() => {
    if (!initialData?.id) return;

    setStep(2);
    const isDependent = initialData.notes?.includes('[DEPENDENT APPOINTMENT]');
    const resolvedBookingType = initialData.bookingType || (isDependent ? 'dependent' : 'myself');
    setBookingType(resolvedBookingType);
    
    setDate(initialData.date || '');
    setTime(initialData.time || '');

    const intake = initialData.intakeForm;
    const patientInfo = intake?.patientInfo;

    const calculateAgeFromDob = (dob?: string) => {
      if (!dob) return '';
      const birthDate = new Date(dob);
      const today = new Date();
      let currentAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        currentAge--;
      }
      return currentAge.toString();
    };

    if (patientInfo) {
      setPatientData(prev => ({
        ...prev,
        name: patientInfo.name || prev.name,
        age: patientInfo.age || prev.age,
        sex: patientInfo.sex || prev.sex,
        dob: patientInfo.dob || prev.dob,
        address: patientInfo.address || prev.address,
        contact: patientInfo.contact || prev.contact,
        email: patientInfo.email || prev.email,
        guardianName: patientInfo.guardianName || prev.guardianName,
        relation: patientInfo.relation || prev.relation
      }));
    } else if (resolvedBookingType === 'myself') {
      const fallbackUser = initialData.patient?.user || user;
      const fallbackPatient = initialData.patient;
      
      if (fallbackUser) {
        setPatientData(prev => ({
          ...prev,
          name: `${fallbackUser.firstName || ''} ${fallbackUser.lastName || ''}`.trim() || prev.name,
          email: fallbackUser.email || prev.email,
          contact: fallbackUser.phone || prev.contact,
          sex: fallbackPatient?.gender === 'FEMALE' ? 'Female' : 'Male',
          dob: fallbackPatient?.dateOfBirth ? new Date(fallbackPatient.dateOfBirth).toISOString().split('T')[0] : prev.dob,
          address: fallbackPatient?.address || prev.address,
          age: calculateAgeFromDob(fallbackPatient?.dateOfBirth) || prev.age,
        }));
      }
    } else if (resolvedBookingType === 'dependent') {
      let depName = initialData.dependentData?.patientName || '';
      let depDob = initialData.dependentData?.dob || '';
      let depGender = initialData.dependentData?.gender === 'FEMALE' ? 'Female' : 'Male';
      let depGuard = initialData.dependentData?.guardianName || '';
      let depRel = initialData.dependentData?.relation || '';

      if (isDependent && !initialData.dependentData) {
        const nameMatch = initialData.notes?.match(/Dependent Name:\s*(.*)/);
        const dobMatch = initialData.notes?.match(/DOB:\s*(.*)/);
        const genderMatch = initialData.notes?.match(/Gender:\s*(.*)/);
        const guardMatch = initialData.notes?.match(/Guardian:\s*(.*)/);
        const relMatch = initialData.notes?.match(/Relation:\s*(.*)/);

        if (nameMatch) depName = nameMatch[1].trim();
        if (dobMatch) depDob = dobMatch[1].trim();
        if (genderMatch) depGender = genderMatch[1].trim() === 'FEMALE' ? 'Female' : 'Male';
        if (guardMatch) depGuard = guardMatch[1].trim();
        if (relMatch) depRel = relMatch[1].trim();
      }

      setPatientData(prev => ({
        ...prev,
        name: depName || prev.name,
        dob: depDob || prev.dob,
        sex: depGender,
        age: calculateAgeFromDob(depDob) || prev.age,
        guardianName: depGuard || prev.guardianName,
        relation: depRel || prev.relation
      }));
    }

    const splitSelections = (value: any) => {
      const normalized = Array.isArray(value) ? value.join(', ') : (typeof value === 'string' ? value : '');
      const parts = normalized.split(',').map((v) => v.trim()).filter(Boolean);
      const other = parts.find((v) => v.startsWith('Other:')) || '';
      const otherText = other.replace('Other:', '').trim();
      const regular = parts.filter((v) => !v.startsWith('Other:'));
      if (otherText) regular.push('Other');
      return { regular, otherText };
    };

    let reasonSource = intake?.reasons;
    if (!reasonSource && initialData.reason) {
      reasonSource = initialData.reason.replace(/^\[.*?\]\s*/, '').trim(); 
    } else if (!reasonSource) {
      reasonSource = [initialData.reasons?.join(', '), initialData.otherReason ? `Other: ${initialData.otherReason}` : ''].filter(Boolean).join(', ');
    }

    const parsedReasons = splitSelections(reasonSource);
    setReasons(parsedReasons.regular);
    setOtherReason(parsedReasons.otherText);

    const symptomSource = intake?.symptoms || (() => {
      const match = initialData.notes?.match(/Symptoms:\s*(.*)/);
      return match ? match[1].trim() : '';
    })();
    const parsedSymptoms = splitSelections(symptomSource);
    setSymptoms(parsedSymptoms.regular);
    setOtherSymptom(parsedSymptoms.otherText);

    const rawHistory = intake?.medicalHistory;
    if (rawHistory && typeof rawHistory === 'object' && !Array.isArray(rawHistory)) {
      setMedHistory({
        illnessType: rawHistory.illnessType || 'none',
        illnessDetails: rawHistory.illnessDetails || '',
        allergy: rawHistory.allergy || '',
        takingMeds: rawHistory.takingMeds || 'No'
      });
    } else if (Array.isArray(rawHistory)) {
      setMedHistory({
        illnessType: rawHistory.length > 0 ? 'existing' : 'none',
        illnessDetails: rawHistory.join(', '),
        allergy: '',
        takingMeds: 'No'
      });
    } else if (typeof rawHistory === 'string' && rawHistory.trim()) {
      setMedHistory({
        illnessType: 'existing',
        illnessDetails: rawHistory,
        allergy: '',
        takingMeds: 'No'
      });
    }
  }, [initialData]);

  // Age calculation
  useEffect(() => {
    if (patientData.dob) {
      const birthDate = new Date(patientData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setPatientData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [patientData.dob]);

  const [reasons, setReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState('');

  const [medHistory, setMedHistory] = useState({
    illnessType: 'none', // 'none' or 'existing'
    illnessDetails: '',
    allergy: '',
    takingMeds: 'No'
  });
  
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [confirmed, setConfirmed] = useState(false);

  // Time Slots
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'];
  const todayString = new Date().toISOString().split('T')[0];

  const handleNext = async () => {
    // Step Validation
    if (step === 2 && bookingType === 'dependent') {
      if (!patientData.name || !patientData.dob || !patientData.relation) {
        warning('Please complete all dependent details');
        return;
      }
    }
    
    if (step === 3) {
      if (reasons.length === 0) {
        warning('Please select at least one reason for visit');
        return;
      }
      if (reasons.includes('Other') && !otherReason.trim()) {
        warning('Please specify the other reason');
        return;
      }
    }

    // Submit Logic at Step 6
    if (step === 6) {
      if (!date || !time) {
        warning('Please select a date and time');
        return;
      }
      if (!confirmed) {
        warning('Please confirm the information');
        return;
      }

      setLoading(true);
      try {
        const reasonString = [
          ...reasons.filter(r => r !== 'Other'),
          otherReason ? `Other: ${otherReason}` : null
        ].filter(Boolean).join(', ');

        const symptomString = [
          ...symptoms.filter(s => s !== 'Other'),
          otherSymptom ? `Other: ${otherSymptom}` : null
        ].filter(Boolean).join(', ');

        const finalIntake = {
          patientInfo: patientData,
          reasons: reasonString,
          symptoms: symptomString,
          medicalHistory: medHistory,
          isDependent: bookingType === 'dependent'
        };

        const payload = {
          patientId: patientId || undefined,
          date,
          time,
          reason: reasonString || 'Consultation',
          notes: bookingType === 'dependent' ? `Guardian: ${patientData.guardianName} (${patientData.relation})` : '',
          intakeForm: finalIntake
        };

        if (initialData?.id) {
           await api.put(`/appointments/${initialData.id}`, payload);
           success('Appointment updated successfully!');
        } else {
           await api.post('/appointments', payload);
           success('Appointment booked successfully!');
        }
        
        setStep(7);
      } catch (err: any) {
        error(err.response?.data?.error || `Failed to ${initialData?.id ? 'update' : 'book'} appointment.`);
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (initialData?.id && step === 2 && onBackToDetails) {
      onBackToDetails();
      return;
    }
    setStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-8 text-center text-text-primary dark:text-dark-text-primary">Who is the appointment for?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
               <button 
                  onClick={() => { setBookingType('myself'); }}
                  className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all group ${bookingType === 'myself' ? 'border-primary bg-primary/10 dark:bg-dark-primary/20' : 'border-border dark:border-dark-border hover:border-primary/50 bg-surface-secondary dark:bg-dark-surface-secondary'}`}
               >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${bookingType === 'myself' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-dark-surface-tertiary text-text-muted dark:text-dark-text-muted-dark group-hover:text-primary'}`}>
                     <User size={32} />
                  </div>
                  <span className="font-bold text-lg text-text-primary dark:text-dark-text-primary">Myself</span>
                  <span className="text-xs text-text-muted dark:text-dark-text-muted-dark mt-2 text-center">Book for your own account</span>
               </button>
               <button 
                  onClick={() => { setBookingType('dependent'); }}
                  className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all group ${bookingType === 'dependent' ? 'border-primary bg-primary/10 dark:bg-dark-primary/20' : 'border-border dark:border-dark-border hover:border-primary/50 bg-surface-secondary dark:bg-dark-surface-secondary'}`}
               >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${bookingType === 'dependent' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-dark-surface-tertiary text-text-muted dark:text-dark-text-muted-dark group-hover:text-primary'}`}>
                     <Users size={32} />
                  </div>
                  <span className="font-bold text-lg text-text-primary dark:text-dark-text-primary">Dependent</span>
                  <span className="text-xs text-text-muted dark:text-dark-text-muted-dark mt-2 text-center">Child or family member</span>
               </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-bold border-b border-border dark:border-dark-border pb-4 uppercase tracking-tighter">Patient Form</h3>
            
            {bookingType === 'dependent' && (
              <div className="space-y-4 bg-blue-50/30 dark:bg-dark-primary/5 p-4 rounded-xl border border-blue-100 dark:border-dark-primary/20">
                <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-primary">Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Guardian Name</label>
                    <input 
                      type="text"
                      readOnly
                      value={patientData.guardianName}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100/50 dark:bg-dark-surface-tertiary text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Relationship</label>
                    <input 
                      type="text"
                      placeholder="e.g. Mother, Father"
                      value={patientData.relation}
                      onChange={(e) => setPatientData({...patientData, relation: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-text-primary dark:text-dark-text-primary">Patient Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Full Name</label>
                  <input 
                    type="text"
                    placeholder="Enter patient full name"
                    value={patientData.name}
                    onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Date of Birth</label>
                  <input 
                    type="date"
                    value={patientData.dob}
                    onChange={(e) => setPatientData({...patientData, dob: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Age</label>
                    <input 
                      type="text"
                      readOnly
                      value={patientData.age}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100/50 dark:bg-dark-surface-tertiary text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Sex</label>
                    <select 
                      value={patientData.sex}
                      onChange={(e) => setPatientData({...patientData, sex: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Address</label>
                  <input 
                    type="text"
                    placeholder="Enter address"
                    value={patientData.address}
                    onChange={(e) => setPatientData({...patientData, address: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Contact Number</label>
                  <input 
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    value={patientData.contact}
                    onChange={(e) => setPatientData({...patientData, contact: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Email Address</label>
                  <input 
                    type="email"
                    placeholder="example@email.com"
                    value={patientData.email}
                    onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tighter">Reason for Visit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Fever', 'Cough / colds', 'Sore throat', 'Headache / dizziness', 
                'Chest pain / palpitations', 'Shortness of breath', 'Stomach / abdominal pain',
                'Diarrhea / vomiting', 'Fatigue / weakness', 'High blood pressure',
                'Diabetes / sugar check', 'Follow-up visit'
              ].map(opt => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-secondary cursor-pointer hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary transition-colors">
                  <input 
                    type="checkbox"
                    checked={reasons.includes(opt)}
                    onChange={(e) => {
                       const next = e.target.checked ? [...reasons, opt] : reasons.filter(r => r !== opt);
                       setReasons(next);
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              ))}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-secondary cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={reasons.includes('Other')}
                    onChange={(e) => {
                       const next = e.target.checked ? [...reasons, 'Other'] : reasons.filter(r => r !== 'Other');
                       setReasons(next);
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Other</span>
                </label>
                {reasons.includes('Other') && (
                  <input 
                    type="text"
                    placeholder="Please specify..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full px-4 py-2 ml-7 w-[calc(100%-1.75rem)] rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tighter">Current Symptoms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Fever', 'Pain', 'Difficulty breathing', 'Vomiting', 'Diarrhea', 'Dizziness / fainting'
              ].map(opt => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-secondary cursor-pointer hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary transition-colors">
                  <input 
                    type="checkbox"
                    checked={symptoms.includes(opt)}
                    onChange={(e) => {
                       const next = e.target.checked ? [...symptoms, opt] : symptoms.filter(s => s !== opt);
                       setSymptoms(next);
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              ))}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border dark:border-dark-border bg-surface-secondary dark:bg-dark-surface-secondary cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={symptoms.includes('Other')}
                    onChange={(e) => {
                       const next = e.target.checked ? [...symptoms, 'Other'] : symptoms.filter(s => s !== 'Other');
                       setSymptoms(next);
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Other</span>
                </label>
                {symptoms.includes('Other') && (
                  <input 
                    type="text"
                    placeholder="Please specify..."
                    value={otherSymptom}
                    onChange={(e) => setOtherSymptom(e.target.value)}
                    className="w-full px-4 py-2 ml-7 w-[calc(100%-1.75rem)] rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tighter">Medical History</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase">Illness</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${medHistory.illnessType === 'none' ? 'border-primary bg-primary/5 text-primary' : 'border-border dark:border-dark-border hover:border-primary/50'}`}>
                    <input type="radio" className="hidden" name="illness" value="none" checked={medHistory.illnessType === 'none'} onChange={(_) => setMedHistory({...medHistory, illnessType: 'none', illnessDetails: ''})} />
                    <span className="font-bold text-sm">No known illness</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${medHistory.illnessType === 'existing' ? 'border-primary bg-primary/5 text-primary' : 'border-border dark:border-dark-border hover:border-primary/50'}`}>
                    <input type="radio" className="hidden" name="illness" value="existing" checked={medHistory.illnessType === 'existing'} onChange={(_) => setMedHistory({...medHistory, illnessType: 'existing'})} />
                    <span className="font-bold text-sm">With existing illness</span>
                  </label>
                </div>
                {medHistory.illnessType === 'existing' && (
                  <input 
                    type="text"
                    placeholder="Describe illness..."
                    value={medHistory.illnessDetails}
                    onChange={(e) => setMedHistory({...medHistory, illnessDetails: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none animate-in fade-in slide-in-from-top-1"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Allergy</label>
                <input 
                  type="text"
                  placeholder="e.g. Peanuts, Penicillin (Leave blank if none)"
                  value={medHistory.allergy}
                  onChange={(e) => setMedHistory({...medHistory, allergy: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase">Currently taking medicines?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(opt => (
                    <label key={opt} className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${medHistory.takingMeds === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border dark:border-dark-border hover:border-primary/50'}`}>
                      <input type="radio" className="hidden" name="meds" value={opt} checked={medHistory.takingMeds === opt} onChange={(e) => setMedHistory({...medHistory, takingMeds: e.target.value})} />
                      <span className="font-bold text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tighter">Schedule & Review</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Preferred Date</label>
                <input 
                   type="date"
                   min={todayString}
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-muted uppercase">Time Slot</label>
                 <select 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-tertiary text-text-primary dark:text-dark-text-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                 >
                    <option value="">Select Time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
            </div>

            <div className="bg-surface-secondary/50 dark:bg-dark-surface-tertiary/30 p-4 rounded-xl border border-border dark:border-dark-border space-y-4 text-xs font-medium">
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Service</span>
                  <span className="text-right">General Consultation - Barangay Iponan Health Clinic</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Type</span>
                  <span className="text-right">{bookingType === 'myself' ? 'Regular' : 'Dependent'}</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Patient Name</span>
                  <span className="text-right">{patientData.name || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Age / Sex</span>
                  <span className="text-right">{patientData.age || 'N/A'} / {patientData.sex || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Date of Birth</span>
                  <span className="text-right">{patientData.dob || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Contact</span>
                  <span className="text-right">{patientData.contact || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Email</span>
                  <span className="text-right break-all">{patientData.email || 'N/A'}</span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Address</span>
                  <span className="text-right max-w-[65%] break-words">{patientData.address || 'N/A'}</span>
               </div>
               {bookingType === 'dependent' && (
                 <>
                   <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                      <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Guardian</span>
                      <span className="text-right">{patientData.guardianName || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                      <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Relationship</span>
                      <span className="text-right">{patientData.relation || 'N/A'}</span>
                   </div>
                 </>
               )}
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Reason</span>
                  <span className="text-right max-w-[65%] break-words">
                    {[...reasons.filter(r => r !== 'Other'), otherReason].filter(Boolean).join(', ') || 'N/A'}
                  </span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Symptoms</span>
                  <span className="text-right max-w-[65%] break-words">
                    {[...symptoms.filter(s => s !== 'Other'), otherSymptom].filter(Boolean).join(', ') || 'None reported'}
                  </span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Medical History</span>
                  <span className="text-right max-w-[65%] break-words">
                    {medHistory.illnessType === 'existing'
                      ? (medHistory.illnessDetails || 'With existing illness')
                      : 'No known illness'}
                  </span>
               </div>
               <div className="flex justify-between border-b border-border dark:border-dark-border pb-2 gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Allergy</span>
                  <span className="text-right max-w-[65%] break-words">{medHistory.allergy || 'None reported'}</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-text-muted font-bold uppercase text-[9px] shrink-0">Taking Medicines</span>
                  <span className="text-right">{medHistory.takingMeds || 'No'}</span>
               </div>
            </div>

            <label className="flex items-start gap-4 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 cursor-pointer">
               <div className={`mt-0.5 w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${confirmed ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white dark:bg-dark-surface-tertiary'}`}>
                  {confirmed && <Check size={14} strokeWidth={3} />}
               </div>
               <div className="flex-1">
                  <input type="checkbox" className="hidden" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                  <span className="text-sm font-bold text-text-primary dark:text-dark-text-primary block">Ready to confirm?</span>
                  <span className="text-[11px] text-text-muted dark:text-dark-text-muted-dark">I verify that the above information is correct and I am ready to book.</span>
               </div>
            </label>
          </div>
        );
      case 7:
        return (
          <div className="p-8 text-center space-y-6 my-12 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100/50 dark:shadow-none">
               <Check size={48} strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Appointment {initialData?.id ? 'Updated' : 'Confirmed'}!</h3>
            <p className="text-text-muted dark:text-dark-text-muted-dark max-w-sm mx-auto">
               Your general consultation on <span className="font-bold text-text-primary dark:text-dark-text-primary">{new Date(date).toLocaleDateString()}</span> has been successfully {initialData?.id ? 'updated' : 'scheduled'}.
            </p>
            
            <div className="pt-8 flex flex-col gap-3 max-w-xs mx-auto">
               <button onClick={() => { onSuccess(); onClose(); }} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity">
                  View My Appointments
               </button>
               <button onClick={onClose} className="w-full py-3.5 text-text-secondary font-bold hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-xl transition-colors">
                  Close
               </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[140] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border dark:border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-bold">{initialData?.id ? 'Edit Appointment' : 'Book Appointment'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-tertiary rounded-full transition-colors">
            <X size={20} className="text-text-muted dark:text-dark-text-muted-dark" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer Navigation */}
        {step < 7 && (
          <div className="p-6 border-t border-border dark:border-dark-border flex justify-between bg-surface-secondary/30 dark:bg-dark-surface-tertiary/10">
            {step > 1 ? (
              <button onClick={handleBack} className="px-6 py-2.5 text-text-secondary font-bold hover:bg-surface-secondary rounded-xl flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
            ) : <div />}
            
            <button 
              onClick={handleNext} 
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Processing...' : (step === 6 ? 'Confirm Appointment' : 'Next')} 
              {!loading && <ChevronRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
