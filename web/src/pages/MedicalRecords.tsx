import React, { useState, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, Plus, FileText, Download, Eye, Loader2, X, ClipboardList, Paperclip } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { Card } from '../components/ui/Card';
import { useMedicalRecords, type MedicalRecord } from '../hooks/useMedicalRecords';
import { usePatients, type Patient } from '../hooks/usePatients';
import { format } from 'date-fns';

const MedicalRecords = () => {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  
  const { records, loading, createRecord } = useMedicalRecords();
  const { patients: searchPatients, loading: searchingPatients } = usePatients(patientSearch);

  const isMedicalStaff = user?.role === 'DOCTOR';

  // Form State
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    attachments: [] as any[]
  });

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return notifyError('Please select a patient first');

    try {
      setSaving(true);
      await createRecord({
        ...formData,
        patientId: selectedPatient.id
      });
      setShowAddModal(false);
      setFormData({ chiefComplaint: '', diagnosis: '', treatment: '', prescription: '', notes: '', attachments: [] });
      
      setSelectedPatient(null);
      success('Medical record created successfully!', 'Record Saved');

    } catch (err: any) {
      notifyError(err.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          date: new Date().toISOString(),
          data: reader.result,
        }]
      }));
      success(`File "${file.name}" attached.`);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      notifyError('No records to export.');
      return;
    }
    const header = 'Visit Date,Chief Complaint,Diagnosis,Treatment,Prescription,Notes\n';
    const rows = records.map(r =>
      [
        format(new Date(r.visitDate), 'yyyy-MM-dd'),
        `"${(r.chiefComplaint || '').replace(/"/g, '""')}"`,
        `"${(r.diagnosis || '').replace(/"/g, '""')}"`,
        `"${(r.treatment || '').replace(/"/g, '""')}"`,
        `"${(r.prescription || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_records_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('Medical history exported as CSV.', 'Export Complete');
  };

  const filteredRecords = records.filter(r => 
    r.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient?.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient?.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {isMedicalStaff ? (
          <div className="px-4 py-2.5 rounded-md bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border text-xs font-bold text-text-muted dark:text-dark-text-muted-dark">
            EMR is generated automatically after consultation.
          </div>
        ) : (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-md font-bold text-sm hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary transition-all shadow-sm dark:shadow-md">
            <Download size={18} />
            Export My History
          </button>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
          <div className="relative flex-1 w-full text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark" size={18} />
            <input
              type="text"
              placeholder="Search records by complaint or patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all text-sm text-text-primary dark:text-dark-text-primary"
            />
          </div>
        </div>

        <div className="space-y-4 min-h-[200px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-dark-surface-secondary/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary dark:text-dark-primary" size={32} />
            </div>
          )}

              {filteredRecords.map((record) => (
                <div key={record.id} className="group p-5 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30 rounded-lg border border-border dark:border-dark-border hover:border-primary/20 dark:hover:border-dark-primary/20 hover:bg-white dark:hover:bg-dark-surface-tertiary/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-dark-surface-secondary rounded-md border border-border dark:border-dark-border flex items-center justify-center text-primary dark:text-dark-primary shadow-sm dark:shadow-md">
                        <FileText size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-text-primary dark:text-dark-text-primary">
                          {record.chiefComplaint}
                        </h4>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted-dark font-medium mb-1">
                          Patient: {record.patient?.user.firstName} {record.patient?.user.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary dark:text-dark-primary uppercase tracking-wider">Medical</span>
                          {record.attachments && record.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                              <Paperclip size={10} /> {record.attachments.length} Files
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">
                          {format(new Date(record.visitDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted-dark font-medium text-right">EMR Record</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setViewingRecord(record);
                            // Track Recent Activity
                            if (record.patient) {
                                const activityItem = {
                                    id: record.patient.id,
                                    patientName: `${record.patient.user.firstName} ${record.patient.user.lastName}`,
                                    action: 'Viewed Record',
                                    timestamp: Date.now()
                                };
                                const stored = localStorage.getItem('recentActivity');
                                const history = stored ? JSON.parse(stored) : [];
                                // Remove duplicates of same patient to keep list fresh
                                const newHistory = [activityItem, ...history.filter((h: any) => h.id !== record.patient?.id)].slice(0, 10);
                                localStorage.setItem('recentActivity', JSON.stringify(newHistory));
                                window.dispatchEvent(new Event('recentActivityUpdated'));
                            }
                          }}
                          className="p-2 hover:bg-primary/5 dark:hover:bg-dark-primary/10 text-text-muted dark:text-dark-text-muted-dark hover:text-primary dark:hover:text-dark-primary rounded transition-colors"
                          title="View record details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && filteredRecords.length === 0 && (
                <div className="p-12 text-center text-text-muted dark:text-dark-text-muted-dark font-medium bg-surface-secondary/20 dark:bg-dark-surface-tertiary/20 rounded-lg border border-dashed border-border dark:border-dark-border">
                  No medical records found.
                </div>
              )}
        </div>
      </Card>

      {/* New medical record modal implementation */}
      {showAddModal && !isMedicalStaff && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 p-0 overflow-hidden">
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-md flex items-center justify-center">
                  <ClipboardList size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">New Medical Record Entry</h3>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted-dark font-medium">Healthcare Provider Console</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Target Patient</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                      type="text"
                      placeholder="Find patient..."
                      value={selectedPatient ? `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}` : patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setSelectedPatient(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none focus:ring-2 focus:ring-primary font-bold transition-all"
                    />
                  </div>
                  {patientSearch && !selectedPatient && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-dark-surface-secondary rounded-lg shadow-2xl border border-border dark:border-dark-border z-50 max-h-48 overflow-y-auto">
                      {searchingPatients ? (
                        <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={20} /></div>
                      ) : searchPatients.length > 0 ? (
                        searchPatients.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatient(p);
                              setPatientSearch('');
                            }}
                            className="w-full p-4 text-left hover:bg-primary/5 transition-colors border-b border-border dark:border-dark-border flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-sm">{p.user.firstName} {p.user.lastName}</p>
                              <p className="text-[10px] text-text-muted font-bold">PT-{p.id.slice(0, 5)}</p>
                            </div>
                            <Plus size={14} className="text-primary" />
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-text-muted">No patient records found</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Visit Date</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none focus:ring-2 focus:ring-primary font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Chief Complaint</label>
                <input
                  type="text"
                  required
                  placeholder="Reason for visit..."
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Clinical Diagnosis</label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Findings after examination..."
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition-all"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Treatment Plan</label>
                  <textarea
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    placeholder="Steps for recovery..."
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition-all"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Attachments & Labs</label>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-primary hover:underline">ATTACH FILE</button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </div>
                <div className="p-4 border-2 border-dashed border-border dark:border-dark-border rounded-lg flex flex-wrap gap-3">
                  {formData.attachments.length === 0 ? (
                    <p className="text-xs text-text-muted w-full text-center py-2 font-medium">No files attached yet. Click "Attach File" above.</p>
                  ) : (
                    formData.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-900/50 text-xs font-bold">
                        <FileText size={14} />
                        {file.name}
                        <button type="button" onClick={() => setFormData(p => ({...p, attachments: p.attachments.filter((_, i) => i !== idx)}))}>
                          <X size={12} className="hover:text-red-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-text-secondary font-bold text-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-md transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-md font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : 'Finalize Record'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Viewing Record Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 p-0 overflow-hidden shadow-2xl bg-white dark:bg-dark-surface-secondary">
            {(() => {
              const notes = viewingRecord.notes || '';
              const lines = notes.split('\n').map((line) => line.trim()).filter(Boolean);
              const getLineValue = (prefix: string, fallback = 'N/A') => {
                const line = lines.find((l) => l.toLowerCase().startsWith(prefix.toLowerCase()));
                if (!line) return fallback;
                const idx = line.indexOf(':');
                return idx >= 0 ? line.slice(idx + 1).trim() || fallback : fallback;
              };

              const patientName = `${viewingRecord.patient?.user.firstName || ''} ${viewingRecord.patient?.user.lastName || ''}`.trim() || 'N/A';
              const chiefComplaint = viewingRecord.chiefComplaint || 'N/A';
              const currentSymptoms = getLineValue('Current Symptoms', 'None reported');
              const allergyHistory = getLineValue('Medication & Allergy History', 'Current Meds: None reported | Drug Allergies: No known allergy');
              const physicalHeart = getLineValue('Heart', 'N/A');
              const physicalAbdomen = getLineValue('Abdomen', 'N/A');
              const physicalSkin = getLineValue('Skin', 'N/A');
              const physicalNotes = getLineValue('Notes', 'None');
              const impressions = getLineValue('Assessment / Impression (Doctor Input)', viewingRecord.diagnosis || 'N/A');
              const finalDiagnosis = getLineValue('Final Diagnosis', viewingRecord.diagnosis || 'N/A');
              const plan = getLineValue('Plan (Doctor Input)', viewingRecord.treatment || 'N/A');
              const doctorName = getLineValue('Doctor Name', 'Dr. ________________');
              const nurseName = getLineValue('Nurse Name', 'N/A');
              const dateSigned = getLineValue('Date Signed', format(new Date(viewingRecord.visitDate), 'M/d/yyyy, hh:mm a'));
              const consultationStatus = getLineValue('Consultation Status', 'Completed');
              const v = viewingRecord.vitalSignsJson || {};
              const vitalLine = `Temp: ${v.temperature ?? '--'} C  |  BP: ${v.bloodPressure ?? '--'}  |  HR: ${v.heartRate ?? '--'} bpm  |  RR: ${v.respiratoryRate ?? '--'} rpm  |  SpO2: ${v.oxygenSaturation ?? '--'} %  |  Wt/Ht: ${v.weight ?? '--'}kg/${v.height ?? '--'}cm`;

              const medsRows = (viewingRecord.prescription || '')
                .split('\n')
                .map((r) => r.trim())
                .filter(Boolean)
                .map((row) => {
                  const parts = row.split('|').map((p) => p.trim());
                  const getPart = (label: string) => {
                    const found = parts.find((p) => p.toLowerCase().startsWith(label.toLowerCase()));
                    return found ? found.split(':').slice(1).join(':').trim() : '-';
                  };
                  return {
                    drug: getPart('Drug'),
                    dose: getPart('Dose'),
                    frequency: getPart('Frequency'),
                    days: getPart('Duration').replace('days', '').trim() || '-'
                  };
                });

              return (
                <>
                  <div className="px-4 py-3 border-b border-border dark:border-dark-border flex items-center justify-between">
                    <h3 className="flex-1 text-center text-base font-black text-text-primary dark:text-dark-text-primary uppercase tracking-tight">Patient EMR Summary</h3>
                    <button onClick={() => setViewingRecord(null)} className="p-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded transition-colors text-text-muted hover:text-text-primary dark:text-dark-text-muted dark:hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto space-y-2 text-[12px] text-text-primary dark:text-dark-text-primary">
                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Clinic & Visit</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <p>Clinic Name: Barangay Iponan Health Clinic</p>
                        <p>Date & Time: {format(new Date(viewingRecord.visitDate), 'M/d/yyyy hh:mm a')}</p>
                        <p className="col-span-2">Visit Type: New </p>
                      </div>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Patient Information</p>
                      <p className="mt-1">Name: {patientName} &nbsp; | &nbsp; DOB: {getLineValue('DOB', 'N/A')} &nbsp; | &nbsp; Age: {getLineValue('Age', 'N/A')} &nbsp; | &nbsp; Sex: {getLineValue('Sex', 'N/A')}</p>
                      <p>Address: {getLineValue('Address', 'N/A')} &nbsp; | &nbsp; Contact No.: {getLineValue('Contact No.', 'N/A')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-border dark:border-dark-border p-2">
                        <p className="font-bold">Chief Complaint <span className="text-text-muted"></span></p>
                        <p className="mt-1">- {chiefComplaint}</p>
                      </div>
                      <div className="border border-border dark:border-dark-border p-2">
                        <p className="font-bold">Current Symptoms <span className="text-text-muted"></span></p>
                        <p className="mt-1">- {currentSymptoms}</p>
                      </div>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Medication & Allergy History <span className="text-text-muted"></span></p>
                      <p className="mt-1">{allergyHistory}</p>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Vital Signs <span className="text-text-muted"></span></p>
                      <p className="mt-1">{vitalLine}</p>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Physical Examination <span className="text-text-muted"></span></p>
                      <p className="mt-1">Heart: {physicalHeart}</p>
                      <p>Abdomen: {physicalAbdomen}</p>
                      <p>Skin: {physicalSkin}</p>
                      <p>Notes: {physicalNotes}</p>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Assessment / Impression <span className="text-text-muted"></span></p>
                      <p className="mt-1">{impressions}</p>
                      <p>Final Diagnosis: {finalDiagnosis}</p>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Plan <span className="text-text-muted"></span></p>
                      <p className="mt-1">{plan}</p>
                      <p className="mt-1 font-bold">Medications Prescribed:</p>
                      <p>{viewingRecord.prescription || 'None'}</p>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Medication Prescription <span className="text-text-muted"></span></p>
                      <table className="w-full mt-1 text-left">
                        <thead>
                          <tr className="border-b border-border dark:border-dark-border">
                            <th className="py-1">Drug</th>
                            <th className="py-1">Dose</th>
                            <th className="py-1">Frequency</th>
                            <th className="py-1">Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medsRows.length > 0 ? medsRows.map((m, i) => (
                            <tr key={i} className="border-b border-border/60 dark:border-dark-border/40">
                              <td className="py-1">{m.drug}</td>
                              <td className="py-1">{m.dose}</td>
                              <td className="py-1">{m.frequency}</td>
                              <td className="py-1">{m.days}</td>
                            </tr>
                          )) : (
                            <tr><td className="py-1" colSpan={4}>No medication entries</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="border border-border dark:border-dark-border p-2">
                      <p className="font-bold">Doctor Information</p>
                      <p className="mt-1">Doctor Name: {doctorName}</p>
                      <p>Nurse Name: {nurseName}</p>
                      <p>Date Signed: {dateSigned}</p>
                      <p>Consultation Status: {consultationStatus}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MedicalRecords;
