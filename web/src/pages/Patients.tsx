import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, Filter, Plus, Mail, Phone, X, Loader2, Eye, EyeOff, ChevronDown, Edit2, Archive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { Card } from '../components/ui/Card';
import { usePatients } from '../hooks/usePatients';

const PASSWORD_MIN_LENGTH = 8;

const Patients = () => {
  const { user } = useAuth();
  const { success, error, info } = useNotification();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { patients, loading, error: patientsError, registerPatient, updatePatient } = usePatients(searchQuery);
  
  const isProvider = ['DOCTOR', 'STAFF', 'ADMIN'].includes(user?.role || '');

  // Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'MALE',
    dateOfBirth: '',
    phone: '',
    address: 'Barangay Iponan, CDO'
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: ''
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    return null;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      error('Please enter a valid email address');
      return;
    }

    const pwError = validatePassword(formData.password);
    if (pwError) {
      error(pwError);
      return;
    }

    try {
      setRegistrationLoading(true);
      await registerPatient({
        ...formData,
        patientData: {
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
        }
      });
      setShowRegisterModal(false);
      setFormData({
        firstName: '', lastName: '', email: '', password: '',
        gender: 'MALE', dateOfBirth: '', phone: '', address: 'Barangay Iponan, CDO'
      });
      success(`Patient ${formData.firstName} ${formData.lastName} registered successfully!`, 'Registration Complete');
    } catch (err: any) {
      error(err.message || 'Failed to register patient');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleOpenEditModal = (patient: any) => {
    setEditFormData({
      id: patient.id,
      firstName: patient.user.firstName || '',
      lastName: patient.user.lastName || '',
      email: patient.user.email || '',
      phone: patient.user.phone || '',
      gender: patient.gender || 'MALE',
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      address: patient.address || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      await updatePatient(editFormData.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phone: editFormData.phone,
        gender: editFormData.gender,
        dateOfBirth: editFormData.dateOfBirth,
        address: editFormData.address
      });
      setShowEditModal(false);
      success('Patient profile updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update patient profile');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {isProvider && (
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/30 dark:shadow-dark-primary/30"
          >
            <Plus size={18} />
            Register New Patient
          </button>
        )}
      </div>

      {isProvider ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary transition-all text-sm text-text-primary dark:text-dark-text-primary"
              />
            </div>
            <div className="relative group">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-md font-bold text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-secondary transition-all outline-none focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-dark-primary">
                <Filter size={18} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent outline-none appearance-none cursor-pointer font-bold text-text-secondary dark:text-dark-text-secondary w-full"
                >
                  <option value="">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <ChevronDown size={14} className="ml-1 opacity-50" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px] relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-dark-surface-secondary/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-primary dark:text-dark-primary" size={32} />
              </div>
            )}

            {patientsError && (
              <div className="p-6 text-center text-red-500 dark:text-red-400 font-medium">
                {patientsError}
              </div>
            )}

            {/* Client-side Filtering Logic */}
            {(() => {
               const filteredPatients = patients.filter(p => {
                 if (!filterStatus) return true;
                 return p.gender === filterStatus;
               });

               if (!loading && filteredPatients.length === 0) {
                 return (
                   <div className="p-12 text-center text-text-muted dark:text-dark-text-muted-dark font-medium">
                     {filterStatus ? `No ${filterStatus.toLowerCase()} patients found matching your search.` : 'No patients found matching your search.'}
                   </div>
                 );
               }

               return (
                 <table className="w-full min-w-[600px] text-left">
                   <thead className="border-b border-border dark:border-dark-border">
                     <tr>
                       <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2">Patient</th>
                      <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Contact Info</th>
                      <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Address</th>
                      <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Gender</th>
                      <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Status</th>
                      <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Actions</th>
                    </tr>
                  </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-dark-surface-tertiary">
                     {filteredPatients.map((p) => (
                       <tr key={p.id} className="group hover:bg-surface-secondary/50 dark:hover:bg-dark-surface-tertiary/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-md flex items-center justify-center font-bold">
                          {p.user.firstName[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary dark:text-dark-text-primary text-sm group-hover:text-primary dark:group-hover:text-dark-primary transition-colors">
                            {p.user.firstName} {p.user.lastName}
                          </h4>
                          <p className="text-[10px] text-text-muted dark:text-dark-text-muted-dark font-bold uppercase tracking-wider">ID: #PT-{p.id.slice(0, 5)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                          <Mail size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                          {p.user.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                          <Phone size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                          {p.user.phone || 'No phone number'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                      {p.address || 'No address'}
                    </td>
                    <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40 text-sm text-text-secondary dark:text-dark-text-secondary font-bold">
                      {p.gender}
                    </td>
                    <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                      <span className="px-3 py-1 bg-primary-light dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit Patient"
                          aria-label={`Edit ${p.user.firstName} ${p.user.lastName}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Archive ${p.user.firstName} ${p.user.lastName}?`)) {
                              info('Archive action placeholder. Connect this to archive endpoint if needed.');
                            }
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Archive Patient"
                          aria-label={`Archive ${p.user.firstName} ${p.user.lastName}`}
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            );
            })()}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-6">Patient Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-1 block">Full Name</label>
                  <p className="font-bold text-text-primary dark:text-dark-text-primary">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-1 block">Email Address</label>
                  <p className="font-bold text-text-primary dark:text-dark-text-primary">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-1 block">Gender (Dummy)</label>
                  <p className="font-bold text-text-primary dark:text-dark-text-primary">Male</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-1 block">Joined</label>
                  <p className="font-bold text-text-primary dark:text-dark-text-primary">January 2026</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border dark:border-dark-border">
              <h4 className="font-bold text-text-primary dark:text-dark-text-primary mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => success('Your medical records have been downloaded.', 'Download Complete')}
                  className="p-4 bg-primary/5 dark:bg-dark-primary/10 text-primary dark:text-dark-primary rounded-lg font-bold hover:bg-primary/10 dark:hover:bg-dark-primary/20 transition-all text-sm">
                  Download My Records
                </button>
                <button
                  onClick={() => info('Data correction request form opened. Please fill in the required details.')}
                  className="p-4 bg-surface-secondary dark:bg-dark-surface-tertiary text-text-secondary dark:text-dark-text-secondary rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-dark-surface-secondary transition-all text-sm border border-border dark:border-dark-border">
                  Request Data Correction
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20 dark:shadow-emerald-600/30">
              <h3 className="font-bold mb-2">Health Card Active</h3>
              <p className="text-xs text-white/80 mb-6 font-medium">Your digital health records are verified and accessible by clinic staff.</p>
              <div className="w-full h-32 bg-white/10 dark:bg-white/5 rounded-lg p-4 flex flex-col justify-end border border-white/20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Barangay Iponan Health</p>
                <h4 className="font-mono text-lg font-medium tracking-widest">#### #### #### 8291</h4>
              </div>
            </Card>
          </div>
        </div>
      )}
      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div
            className="bg-white dark:bg-dark-surface-secondary w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-patient-title"
          >
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/10">
              <h3 id="register-patient-title" className="text-xl font-bold text-text-primary dark:text-dark-text-primary">New Patient Registration</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-md transition-colors focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none"
                aria-label="Close dialog"
              >
                <X size={20} className="text-text-muted dark:text-dark-text-muted-dark" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientFirstName">First Name</label>
                  <input
                    type="text"
                    id="patientFirstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientLastName">Last Name</label>
                  <input
                    type="text"
                    id="patientLastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientEmail">Email Address</label>
                <input
                  type="email"
                  id="patientEmail"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientPassword">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="patientPassword"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                    className="w-full px-4 py-3 pr-12 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark hover:text-text-primary dark:hover:text-dark-text-primary transition-colors" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-text-muted-dark dark:text-dark-text-muted-dark pl-1">Min 8 characters, 1 uppercase, 1 lowercase, 1 number</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientGender">Gender</label>
                  <select
                    id="patientGender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none font-bold text-text-primary dark:text-dark-text-primary"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientBirthDate">Birth Date</label>
                  <input
                    type="date"
                    id="patientBirthDate"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientPhone">Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    id="patientPhone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    onKeyDown={(e) => { if (!/[0-9+]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="patientAddress">Address</label>
                  <input
                    type="text"
                    id="patientAddress"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={registrationLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/30 dark:shadow-dark-primary/30 mt-4 flex items-center justify-center gap-2"
              >
                {registrationLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Registering...
                  </>
                ) : (
                  'Register Patient'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div
            className="bg-white dark:bg-dark-surface-secondary w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-patient-title"
          >
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/10">
              <h3 id="edit-patient-title" className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Edit Patient Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-dark-surface-tertiary rounded-md transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} className="text-text-muted dark:text-dark-text-muted-dark" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">First Name</label>
                  <input value={editFormData.firstName} onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})} required className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Last Name</label>
                  <input value={editFormData.lastName} onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})} required className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Email</label>
                <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} required className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Phone</label>
                  <input value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Gender</label>
                  <select value={editFormData.gender} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Birth Date</label>
                  <input type="date" value={editFormData.dateOfBirth} onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})} className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 block">Address</label>
                  <input value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm font-bold text-text-primary dark:text-dark-text-primary">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} className="px-5 py-2.5 bg-primary text-white rounded-md text-sm font-bold disabled:opacity-50">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Patients;
