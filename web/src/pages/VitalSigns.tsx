import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Activity, Search, Thermometer, Heart, Wind, Scale, Ruler, Droplets, X, Loader2, History, Filter, ChevronDown } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { Card } from '../components/ui/Card';
import { usePatients, type Patient } from '../hooks/usePatients';
import { useVitalSigns, type VitalSign } from '../hooks/useVitalSigns';
import { format } from 'date-fns';
import api from '../services/api';

const VitalSigns = () => {
  const { success, error: notifyError } = useNotification();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const urlPatientId = searchParams.get('patientId');

  const { patients, loading: patientsLoading } = usePatients(searchQuery);
  const { createVitalSign, fetchPatientVitalSigns, loading: vitalsLoading } = useVitalSigns();
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [vitalsHistory, setVitalsHistory] = useState<VitalSign[]>([]);
  
  const [vitalsData, setVitalsData] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    notes: ''
  });

  const handleOpenRecord = (patient: Patient) => {
    setSelectedPatient(patient);
    setVitalsData({
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      notes: ''
    });
    setShowRecordModal(true);
  };

  /* Auto-open modal if patientId is in URL */
  /* Auto-open modal if patientId is in URL */
  useEffect(() => {
    const fetchAndOpen = async () => {
        if (urlPatientId) {
            try {
                // Assuming api.get(`/patients/${id}`) exists based on previous investigation.
                const res = await api.get(`/patients/${urlPatientId}`);
                if (res.data.patient) {
                   handleOpenRecord(res.data.patient);
                }
            } catch (err) {
                console.error("Failed to auto-load patient", err);
            }
        }
    };
    fetchAndOpen();
  }, [urlPatientId]);

  const handleOpenHistory = async (patient: Patient) => {
    setSelectedPatient(patient);
    try {
      const history = await fetchPatientVitalSigns(patient.id);
      setVitalsHistory(history);
      setShowHistoryModal(true);
    } catch (err) {
      notifyError('Failed to load vitals history');
    }
  };

  const blockNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.', '-'];
    if (allowed.includes(e.key)) return;
    if (e.key >= '0' && e.key <= '9') return;
    e.preventDefault();
  };

  const validateVitals = (): string | null => {
    const hr = vitalsData.heartRate ? Number(vitalsData.heartRate) : null;
    const temp = vitalsData.temperature ? Number(vitalsData.temperature) : null;
    const spo2 = vitalsData.oxygenSaturation ? Number(vitalsData.oxygenSaturation) : null;
    const weight = vitalsData.weight ? Number(vitalsData.weight) : null;
    const height = vitalsData.height ? Number(vitalsData.height) : null;
    const rr = vitalsData.respiratoryRate ? Number(vitalsData.respiratoryRate) : null;

    if (hr !== null && (isNaN(hr) || hr < 20 || hr > 300)) return 'Heart rate must be between 20 and 300 bpm.';
    if (temp !== null && (isNaN(temp) || temp < 30 || temp > 45)) return 'Temperature must be between 30°C and 45°C.';
    if (spo2 !== null && (isNaN(spo2) || spo2 < 0 || spo2 > 100)) return 'Oxygen saturation must be between 0% and 100%.';
    if (weight !== null && (isNaN(weight) || weight < 0.1 || weight > 500)) return 'Weight must be between 0.1 and 500 kg.';
    if (height !== null && (isNaN(height) || height < 20 || height > 300)) return 'Height must be between 20 and 300 cm.';
    if (rr !== null && (isNaN(rr) || rr < 5 || rr > 60)) return 'Respiratory rate must be between 5 and 60 bpm.';
    if (vitalsData.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(vitalsData.bloodPressure)) return 'Blood pressure must be in format like 120/80.';
    return null;
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const validationError = validateVitals();
    if (validationError) { notifyError(validationError); return; }

    try {
      await createVitalSign({
        patientId: selectedPatient.id,
        ...vitalsData
      });
      success(`Vital signs for ${selectedPatient.user.firstName} recorded successfully.`, 'Vitals Recorded');
      setShowRecordModal(false);
    } catch (err: any) {
      notifyError(err.message || 'Failed to record vital signs');
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3">
          <Card>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark" size={18} />
                <input
                  type="text"
                  placeholder="Search patient to record or view vitals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all text-sm text-text-primary dark:text-dark-text-primary"
                />
              </div>
              
              <div className="relative group w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-secondary transition-all outline-none focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-dark-primary">
                  <Filter size={18} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent outline-none appearance-none cursor-pointer font-bold text-text-secondary dark:text-dark-text-secondary w-full md:w-auto"
                  >
                    <option value="">All Genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <ChevronDown size={14} className="ml-1 opacity-50" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {patientsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                (() => {
                  const filteredPatients = patients.filter(p => {
                     if (!filterStatus) return true;
                     return p.gender === filterStatus;
                  });

                  if (filteredPatients.length === 0) {
                    return (
                      <div className="text-center py-12 text-text-muted dark:text-dark-text-muted-dark">
                         {filterStatus ? `No ${filterStatus.toLowerCase()} patients found.` : 'No patients found.'}
                      </div>
                    );
                  }

                  return filteredPatients.map((p) => (
                  <div key={p.id} className="p-4 bg-surface-secondary/30 dark:bg-dark-surface-tertiary/30 rounded-2xl border border-border dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-xl flex items-center justify-center font-bold">
                        {p.user.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary dark:text-dark-text-primary">
                          {p.user.firstName} {p.user.lastName}
                        </h4>
                        <p className="text-[10px] text-text-muted-dark dark:text-dark-text-muted-dark font-bold uppercase tracking-wider">
                          Last Updated: {p.lastVitalDate ? format(new Date(p.lastVitalDate), 'MMM d, yyyy h:mm a') : 'Not recorded'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenHistory(p)}
                        className="p-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary text-text-secondary dark:text-dark-text-secondary rounded-xl hover:bg-white dark:hover:bg-dark-surface-secondary transition-all border border-border dark:border-dark-border"
                        title="View History"
                      >
                        <History size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenRecord(p)}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
                      >
                        Record Vitals
                      </button>
                    </div>
                  </div>
                ));
                })()
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 dark:bg-dark-primary/10 border-primary/20 dark:border-dark-primary/20">
            <h4 className="text-xs font-bold text-primary dark:text-dark-primary uppercase tracking-widest mb-4">Standard Reference</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary">
                  <Thermometer size={14} className="text-primary dark:text-dark-primary" />
                  <span className="text-xs font-medium">Temperature</span>
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary">36.5-37.5°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary">
                  <Heart size={14} className="text-primary dark:text-dark-primary" />
                  <span className="text-xs font-medium">Pulse Rate</span>
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary">60-100 bpm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary">
                  <Activity size={14} className="text-primary dark:text-dark-primary" />
                  <span className="text-xs font-medium">Blood Pressure</span>
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary">120/80 mmHg</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary">
                  <Wind size={14} className="text-primary dark:text-dark-primary" />
                  <span className="text-xs font-medium">Resp. Rate</span>
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary">12-20 bpm</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Record Vitals Modal */}
      {showRecordModal && selectedPatient && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 p-0 overflow-hidden">
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/5">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
                  <Activity className="text-primary" />
                  Record Vital Signs
                </h3>
                <p className="text-xs text-text-muted mt-1">For {selectedPatient.user.firstName} {selectedPatient.user.lastName}</p>
              </div>
              <button 
                onClick={() => setShowRecordModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitVitals} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Blood Pressure (mmHg)</label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="text" 
                      placeholder="e.g. 120/80"
                      value={vitalsData.bloodPressure}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9/]/g, '');
                        setVitalsData({...vitalsData, bloodPressure: val});
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Heart Rate (bpm)</label>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="number" 
                      placeholder="e.g. 72"
                      min="20" max="300"
                      value={vitalsData.heartRate}
                      onKeyDown={blockNonNumeric}
                      onChange={(e) => setVitalsData({...vitalsData, heartRate: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Temperature (°C)</label>
                  <div className="relative">
                    <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g. 36.5"
                      min="30" max="45"
                      value={vitalsData.temperature}
                      onKeyDown={blockNonNumeric}
                      onChange={(e) => setVitalsData({...vitalsData, temperature: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Oxygen Saturation (%)</label>
                  <div className="relative">
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="number" 
                      placeholder="e.g. 98"
                      min="0" max="100"
                      value={vitalsData.oxygenSaturation}
                      onKeyDown={blockNonNumeric}
                      onChange={(e) => setVitalsData({...vitalsData, oxygenSaturation: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g. 70.5"
                      min="0.1" max="500"
                      value={vitalsData.weight}
                      onKeyDown={blockNonNumeric}
                      onChange={(e) => setVitalsData({...vitalsData, weight: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="number" 
                      placeholder="e.g. 175"
                      min="20" max="300"
                      value={vitalsData.height}
                      onKeyDown={blockNonNumeric}
                      onChange={(e) => setVitalsData({...vitalsData, height: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest pl-1">Notes / Observations</label>
                <textarea 
                  rows={3}
                  placeholder="Additional health notes..."
                  value={vitalsData.notes}
                  onChange={(e) => setVitalsData({...vitalsData, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>

              <div className="mt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 py-3.5 text-sm font-bold text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={vitalsLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {vitalsLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Vital Signs'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Vitals History Modal */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 p-0 flex flex-col">
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/5">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-2">
                  <History className="text-primary" />
                  Vitals History
                </h3>
                <p className="text-xs text-text-muted mt-1">Medical history for {selectedPatient.user.firstName} {selectedPatient.user.lastName}</p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-0 overflow-y-auto flex-1">
              {vitalsHistory.length === 0 ? (
                <div className="py-20 text-center text-text-muted dark:text-dark-text-muted-dark">
                  No vital signs recorded for this patient.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-surface-secondary dark:bg-dark-surface-tertiary z-10">
                      <tr className="border-b border-border dark:border-dark-border">
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">BP</th>
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">HR</th>
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Temp</th>
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">SpO2</th>
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Weight</th>
                        <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-dark-border">
                      {vitalsHistory.map((v) => (
                        <tr key={v.id} className="hover:bg-primary/5 transition-colors">
                          <td className="p-4">
                            <span className="text-sm font-bold text-text-primary dark:text-dark-text-primary block">
                              {format(new Date(v.recordedAt), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-[10px] text-text-muted uppercase">{format(new Date(v.recordedAt), 'hh:mm a')}</span>
                          </td>
                          <td className="p-4 text-sm font-medium">{v.bloodPressure || '-'}</td>
                          <td className="p-4 text-sm font-medium">{v.heartRate ? `${v.heartRate} bpm` : '-'}</td>
                          <td className="p-4 text-sm font-medium">{v.temperature ? `${v.temperature}°C` : '-'}</td>
                          <td className="p-4 text-sm font-medium">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : '-'}</td>
                          <td className="p-4 text-sm font-medium">{v.weight ? `${v.weight} kg` : '-'}</td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary block">
                              {v.recordedBy.firstName} {v.recordedBy.lastName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase font-bold tracking-tighter">
                              {v.recordedBy.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border dark:border-dark-border bg-surface-secondary/50 dark:bg-dark-surface-tertiary/50">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-3 bg-white dark:bg-dark-surface-secondary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-dark-surface-tertiary transition-all"
              >
                Close History
              </button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VitalSigns;
