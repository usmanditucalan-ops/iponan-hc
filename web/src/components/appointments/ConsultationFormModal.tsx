import { useEffect, useMemo, useState } from 'react';
import { X, ClipboardList, Check, Loader2, Stethoscope, Trash2 } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import api from '../../services/api';

interface ConsultationFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  appointment: any;
}

interface MedicationRow {
  drug: string;
  dose: string;
  frequency: string;
  days: string;
}

export const ConsultationFormModal = ({ onClose, onSuccess, appointment }: ConsultationFormModalProps) => {
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [step, setStep] = useState(1);
  const [latestVitalSign, setLatestVitalSign] = useState<any>(null);

  const [physicalExam, setPhysicalExam] = useState({
    heartRegular: true,
    heartAbnormal: false,
    abdomenSoft: true,
    abdomenTenderness: false,
    skinNoRashes: true,
    skinFindings: false,
    notes: ''
  });

  const [assessmentPlan, setAssessmentPlan] = useState({
    impressions: ['Viral Infection', 'Stable / Improving'] as string[],
    otherImpression: '',
    finalDiagnosis: 'Acute Upper Respiratory Infection',
    followUpDate: '',
  });

  const [medications, setMedications] = useState<MedicationRow[]>([
    { drug: 'Paracetamol', dose: '500 mg', frequency: 'Every 6 hrs', days: '5' }
  ]);

  const patientName = appointment.patient?.user
    ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
    : 'Unknown Patient';

  const normalizeIntake = (value: any) => {
    if (!value) return {};
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return {}; }
    }
    return typeof value === 'object' ? value : {};
  };
  const intake = normalizeIntake(appointment.intakeForm);
  const patientInfo = intake.patientInfo || {};
  const stringifyValue = (value: any): string => {
    if (Array.isArray(value)) return value.map((v) => stringifyValue(v)).filter(Boolean).join(', ');
    if (value && typeof value === 'object') return Object.values(value).map((v) => stringifyValue(v)).filter(Boolean).join(', ');
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };
  const currentSymptoms = stringifyValue(intake.symptoms || intake.currentSymptoms) || 'None reported';
  const medicalHistory = intake.medicalHistory || intake.history || null;
  const medicalHistoryObj =
    medicalHistory && typeof medicalHistory === 'object' && !Array.isArray(medicalHistory)
      ? medicalHistory
      : null;
  const doctorName = appointment?.doctor
    ? `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.trim()
    : 'Dr. ________________';

  useEffect(() => {
    let active = true;
    const fetchVitals = async () => {
      if (!appointment?.patientId) {
        setLatestVitalSign(null);
        setLoadingVitals(false);
        return;
      }
      try {
        setLoadingVitals(true);
        const res = await api.get(`/vital-signs/patient/${appointment.patientId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        if (active) setLatestVitalSign(list[0] || null);
      } catch {
        if (active) setLatestVitalSign(null);
      } finally {
        if (active) setLoadingVitals(false);
      }
    };
    fetchVitals();
    return () => { active = false; };
  }, [appointment?.patientId]);

  const assessmentOptions = [
    'Viral Infection',
    'Bacterial Infection',
    'Allergic Condition',
    'Gastrointestinal Condition',
    'Cardiovascular Condition',
    'Stable / Improving',
    'Others'
  ];

  const toggleImpression = (label: string) => {
    setAssessmentPlan((prev) => {
      const exists = prev.impressions.includes(label);
      return {
        ...prev,
        impressions: exists
          ? prev.impressions.filter((i) => i !== label)
          : [...prev.impressions, label]
      };
    });
  };

  const updateMedication = (index: number, field: keyof MedicationRow, value: string) => {
    setMedications((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addMedication = () => {
    setMedications((prev) => [...prev, { drug: '', dose: '', frequency: '', days: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const physicalSummary = useMemo(() => {
    return {
      heart: physicalExam.heartRegular ? 'Regular rate and rhythm' : 'With abnormal heart sounds',
      abdomen: physicalExam.abdomenSoft ? 'Soft and non-tender' : 'With abdominal tenderness',
      skin: physicalExam.skinNoRashes ? 'No rashes or lesions' : 'With skin findings',
      notes: physicalExam.notes || 'None'
    };
  }, [physicalExam]);

  const validMedications = medications
    .filter((m) => (m.drug || '').trim() && (m.dose || '').trim() && (m.frequency || '').trim() && (m.days || '').trim());

  const medicationText = validMedications
    .map((m) => `Drug: ${m.drug || 'N/A'} | Dose: ${m.dose || 'N/A'} | Frequency: ${m.frequency || 'N/A'} | Duration: ${m.days || 'N/A'} days`)
    .join('\n');

  const canSaveEmr =
    !!assessmentPlan.finalDiagnosis.trim() &&
    (assessmentPlan.impressions.length > 0) &&
    !!latestVitalSign &&
    !loadingVitals;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (assessmentPlan.impressions.length === 0) {
        warning('Please select at least one Assessment / Impression.');
        return;
      }
      if (assessmentPlan.impressions.includes('Others') && !assessmentPlan.otherImpression.trim()) {
        warning('Please specify the other assessment/impression.');
        return;
      }
      if (!assessmentPlan.finalDiagnosis.trim()) {
        warning('Please enter the final diagnosis.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSaveEMR = async () => {
    if (!canSaveEmr) {
      warning('Complete required consultation fields and ensure vital signs are available before saving EMR.');
      return;
    }
    setLoading(true);
    try {
      const nurseObj = latestVitalSign?.recordedBy?.user || latestVitalSign?.recordedBy;
      const nurseName = nurseObj
        ? `${nurseObj.firstName || ''} ${nurseObj.lastName || ''}`.trim()
        : 'N/A';
      const signedAt = new Date().toISOString();
      const vitalsSummary = `Temp: ${latestVitalSign?.temperature ?? '--'} C | BP: ${latestVitalSign?.bloodPressure ?? '--'} | HR: ${latestVitalSign?.heartRate ?? '--'} bpm | RR: ${latestVitalSign?.respiratoryRate ?? '--'} rpm | SpO2: ${latestVitalSign?.oxygenSaturation ?? '--'} % | Wt/Ht: ${latestVitalSign?.weight ?? '--'}kg/${latestVitalSign?.height ?? '--'}cm`;

      const consultationForm = {
        assessment: assessmentPlan.finalDiagnosis,
        plan: `Follow-up Date: ${assessmentPlan.followUpDate || 'Not set'}`,
        physicalExam: physicalSummary,
        assessmentPlan: {
          ...assessmentPlan,
          medications: validMedications
        },
        emrSummary: {
          clinicName: 'Barangay Iponan Health Clinic',
          visitType: 'New / Follow-up',
          generatedAt: signedAt,
          status: 'COMPLETED',
          doctorName,
          nurseName
        },
        nurseVitalSigns: {
          temperature: latestVitalSign?.temperature ?? null,
          bloodPressure: latestVitalSign?.bloodPressure ?? null,
          heartRate: latestVitalSign?.heartRate ?? null,
          respiratoryRate: latestVitalSign?.respiratoryRate ?? null,
          oxygenSaturation: latestVitalSign?.oxygenSaturation ?? null,
          weight: latestVitalSign?.weight ?? null,
          height: latestVitalSign?.height ?? null,
          recordedBy: nurseName,
          recordedAt: latestVitalSign?.recordedAt ?? null
        }
      };

      const notes = [
        'PATIENT EMR SUMMARY',
        'Clinic & Visit',
        `Clinic Name: Barangay Iponan Health Clinic`,
        `Date & Time: ${new Date(appointment.date).toLocaleDateString()} ${appointment.time}`,
        `Visit Type: [ New / Follow-up ]`,
        '',
        'Patient Information',
        `Name: ${patientName} | DOB: ${patientInfo.dob || (appointment.patient?.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString() : 'N/A')} | Age: ${patientInfo.age || 'N/A'} | Sex: ${patientInfo.sex || appointment.patient?.gender || 'N/A'}`,
        `Address: ${patientInfo.address || appointment.patient?.address || 'N/A'} | Contact No.: ${patientInfo.contact || appointment.patient?.user?.phone || 'N/A'}`,
        '',
        `Chief Complaint : ${appointment.reason || 'N/A'}`,
        `Current Symptoms : ${currentSymptoms || 'N/A'}`,
        `Medication & Allergy History : Current Meds: ${medicalHistoryObj ? (medicalHistoryObj.takingMeds || 'None reported') : 'None reported'} | Drug Allergies: ${medicalHistoryObj ? (medicalHistoryObj.allergy || 'No known allergy') : 'No known allergy'}`,
        `Vital Signs : ${vitalsSummary}`,
        '',
        'Physical Examination ',
        `Heart: ${physicalSummary.heart}`,
        `Abdomen: ${physicalSummary.abdomen}`,
        `Skin: ${physicalSummary.skin}`,
        `Notes: ${physicalSummary.notes}`,
        '',
        `Assessment / Impression: ${(() => {
          const allImpressions = [...assessmentPlan.impressions.filter(i => i !== 'Others')];
          if (assessmentPlan.impressions.includes('Others') && assessmentPlan.otherImpression.trim()) {
            allImpressions.push(`Others: ${assessmentPlan.otherImpression.trim()}`);
          }
          return allImpressions.join(', ') || 'N/A';
        })()}`,
        `Final Diagnosis: ${assessmentPlan.finalDiagnosis || 'N/A'}`,
        `Plan: Follow-up Date: [ ${assessmentPlan.followUpDate || '--'} ]`,
        `Medications Prescribed: ${medicationText || 'None'}`,
        '',
        `Doctor Name: ${doctorName}`,
        `Nurse Name: ${nurseName}`,
        `Date Signed: ${new Date(signedAt).toLocaleString()}`,
        `Consultation Status: COMPLETED`
      ].join('\n');

      await api.post('/medical-records', {
        patientId: appointment.patientId,
        visitDate: appointment.date,
        chiefComplaint: appointment.reason,
        diagnosis: assessmentPlan.finalDiagnosis,
        treatment: `Follow-up Date: ${assessmentPlan.followUpDate || 'Not set'}`,
        prescription: medicationText || 'None',
        vitalSigns: {
          bloodPressure: latestVitalSign?.bloodPressure ?? null,
          heartRate: latestVitalSign?.heartRate ?? null,
          temperature: latestVitalSign?.temperature ?? null,
          respiratoryRate: latestVitalSign?.respiratoryRate ?? null,
          oxygenSaturation: latestVitalSign?.oxygenSaturation ?? null,
          weight: latestVitalSign?.weight ?? null,
          height: latestVitalSign?.height ?? null,
          recordedBy: nurseName,
          recordedAt: latestVitalSign?.recordedAt ?? null
        },
        notes
      });

      await api.put(`/appointments/${appointment.id}`, {
        status: 'COMPLETED',
        consultationForm
      });

      success('Official EMR saved successfully.');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to save official EMR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[140] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">PATIENT ELECTRONIC MEDICAL RECORD</h2>
              <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">
               
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-md transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-4 font-bold flex items-center gap-2"><Stethoscope size={20} /> Physical Examination</h3>

              <div className="space-y-4">
                <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30">
                  <h4 className="font-bold mb-2 text-2xl">Heart:</h4>
                  <label className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={physicalExam.heartRegular} onChange={(e) => setPhysicalExam({ ...physicalExam, heartRegular: e.target.checked, heartAbnormal: !e.target.checked ? true : physicalExam.heartAbnormal })} />
                    <span className="font-medium">Regular rate and rhythm</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={physicalExam.heartAbnormal} onChange={(e) => setPhysicalExam({ ...physicalExam, heartAbnormal: e.target.checked, heartRegular: !e.target.checked ? true : physicalExam.heartRegular })} />
                    <span className="font-medium">With abnormal heart sounds</span>
                  </label>
                </div>

                <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30">
                  <h4 className="font-bold mb-2 text-2xl">Abdomen:</h4>
                  <label className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={physicalExam.abdomenSoft} onChange={(e) => setPhysicalExam({ ...physicalExam, abdomenSoft: e.target.checked, abdomenTenderness: !e.target.checked ? true : physicalExam.abdomenTenderness })} />
                    <span className="font-medium">Soft and non-tender</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={physicalExam.abdomenTenderness} onChange={(e) => setPhysicalExam({ ...physicalExam, abdomenTenderness: e.target.checked, abdomenSoft: !e.target.checked ? true : physicalExam.abdomenSoft })} />
                    <span className="font-medium">With abdominal tenderness</span>
                  </label>
                </div>

                <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30">
                  <h4 className="font-bold mb-2 text-2xl">Skin:</h4>
                  <label className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={physicalExam.skinNoRashes} onChange={(e) => setPhysicalExam({ ...physicalExam, skinNoRashes: e.target.checked, skinFindings: !e.target.checked ? true : physicalExam.skinFindings })} />
                    <span className="font-medium">No rashes or lesions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={physicalExam.skinFindings} onChange={(e) => setPhysicalExam({ ...physicalExam, skinFindings: e.target.checked, skinNoRashes: !e.target.checked ? true : physicalExam.skinNoRashes })} />
                    <span className="font-medium">With skin findings</span>
                  </label>
                </div>

                <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30">
                  <h4 className="font-bold mb-2 text-2xl">Notes:</h4>
                  <textarea
                    value={physicalExam.notes}
                    onChange={(e) => setPhysicalExam({ ...physicalExam, notes: e.target.value })}
                    placeholder="Additional examination notes..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-4 font-bold flex items-center gap-2"><ClipboardList size={20} /> Assessment & Plan</h3>

              <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30">
                <h4 className="font-bold mb-2 text-2xl">Assessment / Impression:</h4>
                <div className="space-y-1">
                  {assessmentOptions.map((opt) => (
                    <div key={opt} className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={assessmentPlan.impressions.includes(opt)} onChange={() => toggleImpression(opt)} />
                        <span className="font-medium">{opt}</span>
                      </label>
                      {opt === 'Others' && assessmentPlan.impressions.includes('Others') && (
                        <div className="pl-6 pb-2">
                          <input
                            value={assessmentPlan.otherImpression}
                            onChange={(e) => setAssessmentPlan({ ...assessmentPlan, otherImpression: e.target.value })}
                            placeholder="Please specify..."
                            className="w-full px-3 py-1.5 rounded border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-xs outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30">
                <h4 className="font-bold mb-2 text-2xl">Final Diagnosis:</h4>
                <input
                  value={assessmentPlan.finalDiagnosis}
                  onChange={(e) => setAssessmentPlan({ ...assessmentPlan, finalDiagnosis: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none"
                />
              </div>

              <div className="rounded-lg border border-border dark:border-dark-border p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30 space-y-3">
                <h4 className="font-bold mb-1 text-2xl">Medication Prescription:</h4>

                <div className="space-y-2">
                  {medications.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input value={m.drug} onChange={(e) => updateMedication(idx, 'drug', e.target.value)} placeholder="Drug" className="col-span-3 px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none" />
                      <input value={m.dose} onChange={(e) => updateMedication(idx, 'dose', e.target.value)} placeholder="Dose" className="col-span-3 px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none" />
                      <input value={m.frequency} onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} placeholder="Frequency" className="col-span-3 px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none" />
                      <input value={m.days} onChange={(e) => updateMedication(idx, 'days', e.target.value)} placeholder="Days" className="col-span-2 px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none" />
                      <button type="button" onClick={() => removeMedication(idx)} className="col-span-1 p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addMedication} className="w-full py-2 rounded-md border border-border dark:border-dark-border font-bold text-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary">
                  + Add Medication
                </button>

                <div className="pt-2">
                  <label className="text-[10px] font-bold uppercase text-text-muted block mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={assessmentPlan.followUpDate}
                    onChange={(e) => setAssessmentPlan({ ...assessmentPlan, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border dark:border-dark-border bg-white dark:bg-dark-surface-secondary text-text-primary dark:text-dark-text-primary text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2 text-sm">
              <h3 className="text-center text-xl font-black">PATIENT EMR SUMMARY</h3>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Clinic & Visit</h4>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <p> <span className="font-semibold">Clinic Name:</span> Barangay Iponan Health Clinic</p>
                  <p> <span className="font-semibold">Date & Time:</span> {new Date(appointment.date).toLocaleDateString()} {appointment.time}</p>
                  <p className="col-span-2"> <span className="font-semibold">Visit Type:</span> [ New / Follow-up ]</p>
                </div>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Patient Information</h4>
                <p className="mt-1">
                  <span className="font-semibold">Name:</span> {patientName} &nbsp; | &nbsp;
                  <span className="font-semibold">DOB:</span> {patientInfo.dob || (appointment.patient?.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString() : 'N/A')} &nbsp; | &nbsp;
                  <span className="font-semibold">Age:</span> {patientInfo.age || 'N/A'} &nbsp; | &nbsp;
                  <span className="font-semibold">Sex:</span> {patientInfo.sex || appointment.patient?.gender || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Address:</span> {patientInfo.address || appointment.patient?.address || 'N/A'} &nbsp; | &nbsp;
                  <span className="font-semibold">Contact No.:</span> {patientInfo.contact || appointment.patient?.user?.phone || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="border border-border dark:border-dark-border p-3">
                  <h4 className="font-bold">Chief Complaint <span className="text-text-muted"></span></h4>
                  <p className="mt-1 whitespace-pre-wrap">- {appointment.reason || 'N/A'}</p>
                </div>
                <div className="border border-border dark:border-dark-border p-3">
                  <h4 className="font-bold">Current Symptoms <span className="text-text-muted"></span></h4>
                  <p className="mt-1 whitespace-pre-wrap">- {currentSymptoms || 'N/A'}</p>
                </div>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Medication & Allergy History <span className="text-text-muted"></span></h4>
                <p className="mt-1">
                  Current Meds: {medicalHistoryObj ? (medicalHistoryObj.takingMeds || 'None reported') : 'None reported'}
                  &nbsp; | &nbsp;
                  Drug Allergies: {medicalHistoryObj ? (medicalHistoryObj.allergy || 'No known allergy') : 'No known allergy'}
                </p>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Vital Signs <span className="text-text-muted"></span></h4>
                <p className="mt-1">
                  Temp: {latestVitalSign?.temperature ?? '--'} C &nbsp; | &nbsp;
                  BP: {latestVitalSign?.bloodPressure ?? '--'} &nbsp; | &nbsp;
                  HR: {latestVitalSign?.heartRate ?? '--'} bpm &nbsp; | &nbsp;
                  RR: {latestVitalSign?.respiratoryRate ?? '--'} rpm &nbsp; | &nbsp;
                  SpO2: {latestVitalSign?.oxygenSaturation ?? '--'} % &nbsp; | &nbsp;
                  Wt/Ht: {latestVitalSign?.weight ?? '--'}kg/{latestVitalSign?.height ?? '--'}cm
                </p>
                {!latestVitalSign && (
                  <p className="mt-2 text-xs text-red-600">No nurse-recorded vital signs found. Save EMR is disabled until vitals are available.</p>
                )}
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Physical Examination <span className="text-text-muted"></span></h4>
                <p className="mt-1"> <span className="font-semibold">Heart:</span> {physicalSummary.heart}</p>
                <p> <span className="font-semibold">Abdomen:</span> {physicalSummary.abdomen}</p>
                <p> <span className="font-semibold">Skin:</span> {physicalSummary.skin}</p>
                <p> <span className="font-semibold">Notes:</span> {physicalSummary.notes}</p>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Assessment / Impression <span className="text-text-muted"></span></h4>
                <p className="mt-1 whitespace-pre-wrap">{(() => {
                  const allImpressions = [...assessmentPlan.impressions.filter(i => i !== 'Others')];
                  if (assessmentPlan.impressions.includes('Others') && assessmentPlan.otherImpression.trim()) {
                    allImpressions.push(`Others: ${assessmentPlan.otherImpression.trim()}`);
                  }
                  return allImpressions.join('\n') || 'N/A';
                })()}</p>
                <p> <span className="font-semibold">Final Diagnosis:</span> {assessmentPlan.finalDiagnosis || 'N/A'}</p>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Plan <span className="text-text-muted"></span></h4>
                <p className="mt-1"> <span className="font-semibold">Follow-up Date:</span> [ {assessmentPlan.followUpDate || '--'} ]</p>
                <p className="mt-2 font-bold">Medications Prescribed:</p>
                <p className="whitespace-pre-wrap">{medicationText || 'None'}</p>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Medication Prescription <span className="text-text-muted"></span></h4>
                <table className="w-full mt-2 text-left text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-dark-border">
                      <th className="py-1">Drug</th>
                      <th className="py-1">Dose</th>
                      <th className="py-1">Frequency</th>
                      <th className="py-1">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validMedications.length > 0 ? (
                      validMedications.map((m, idx) => (
                        <tr key={idx} className="border-b border-border/50 dark:border-dark-border/40">
                          <td className="py-1">{m.drug || '-'}</td>
                          <td className="py-1">{m.dose || '-'}</td>
                          <td className="py-1">{m.frequency || '-'}</td>
                          <td className="py-1">{m.days || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-1" colSpan={4}>No medication entries</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border border-border dark:border-dark-border p-3">
                <h4 className="font-bold">Staff Information</h4>
                <p className="mt-1">
  <span className="font-semibold">Doctor Name:</span> {doctorName}
</p>
                <p> <span className="font-semibold">Nurse Name: </span> {(() => {
                  const nurseObj = latestVitalSign?.recordedBy?.user || latestVitalSign?.recordedBy;
                  return nurseObj ? `${nurseObj.firstName || ''} ${nurseObj.lastName || ''}`.trim() : 'N/A';
                })()}</p>
                <p> <span className="font-semibold">Date Signed: </span> {new Date().toLocaleString()}</p>
                <p>  <span className="font-semibold">Consultation Status:</span> Completed</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border dark:border-dark-border bg-surface-secondary/30 dark:bg-dark-surface-tertiary/10 flex justify-between gap-3 rounded-b-2xl">
          {step > 1 ? (
            <button onClick={handleBack} className="px-6 py-2.5 text-text-secondary font-bold hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-md transition-all">
              Back
            </button>
          ) : (
            <button onClick={onClose} className="px-6 py-2.5 text-text-secondary font-bold hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-md transition-all">
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button onClick={handleNext} className="px-8 py-2.5 bg-primary text-white font-bold rounded-md shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity">
              Next
            </button>
          ) : (
            <button
              onClick={handleSaveEMR}
              disabled={loading || !canSaveEmr}
              className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-md shadow-lg shadow-green-600/30 flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              {loading ? 'Saving...' : 'Save EMR'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
