import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, Filter, Plus, X, Loader2, Eye, EyeOff, Edit2, Archive, Mail, Phone } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { Card } from '../components/ui/Card';
import { useUsers } from '../hooks/useUsers';
import { usePatients } from '../hooks/usePatients';
import api from '../services/api';


const PASSWORD_MIN_LENGTH = 8;

interface UsersProps {
  viewMode?: 'staff' | 'patients' | 'all';
}

const Users: React.FC<UsersProps> = ({ viewMode = 'all' }) => {
  const { success, error } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [creationLoading, setCreationLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: '',
    gender: 'MALE',
    address: '',
    password: ''
  });

  // Pass 'PATIENT' to useUsers if viewMode is patients to optimize fetch, otherwise fetch all
  const useUsersRoleFilter = viewMode === 'patients' ? 'PATIENT' : roleFilter;
  const { users, loading, error: usersError, createUser, updateUser } = useUsers(useUsersRoleFilter);
  const { patients, loading: patientsLoading, error: patientsError, refresh: refreshPatients } = usePatients(viewMode === 'patients' ? searchQuery : undefined);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: viewMode === 'patients' ? 'PATIENT' : 'STAFF',
    phone: '',
    gender: 'MALE',
    address: ''
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    return null;
  };

  const formatRoleLabel = (role: string) => (role === 'DOCTOR' ? 'PHYSICIAN' : role);

  const filteredUsers = users.filter((u) => {
    // 1. View Mode Filter
    if (viewMode === 'staff') {
       if (u.role === 'PATIENT') return false;
    } else if (viewMode === 'patients') {
       if (u.role !== 'PATIENT') return false;
    }

    // 2. Search Filter
    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchesSearch = (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

    // 3. Status Filter (Placeholder)
    let matchesStatus = true;
    if (statusFilter === 'active') {
       matchesStatus = true; 
    }

    return matchesSearch && matchesStatus;
  });

  const filteredPatients = patients.filter((p) => {
    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchesSearch = (
        p.user.firstName.toLowerCase().includes(q) ||
        p.user.lastName.toLowerCase().includes(q) ||
        p.user.email.toLowerCase().includes(q)
      );
    }

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = true;
    }

    return matchesSearch && matchesStatus;
  });

  /* 
   * Enhanced form validation 
   */
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic empty checks (though 'required' attribute handles most)
    if (!formData.firstName.trim()) { error("First name is required"); return; }
    if (!formData.lastName.trim()) { error("Last name is required"); return; }
    if (!formData.email.trim()) { error("Email is required"); return; }
    if (!formData.phone.trim()) { error("Phone number is required"); return; }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { error("Please enter a valid email address"); return; }

    // 3. Password validation
    const pwError = validatePassword(formData.password);
    if (pwError) { error(pwError); return; }

    try {
      setCreationLoading(true);
      await createUser(formData);
      setShowCreateModal(false);
      // Reset form, intelligently setting default role
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        password: '', 
        role: viewMode === 'patients' ? 'PATIENT' : 'STAFF', 
        phone: '',
        gender: 'MALE',
        address: ''
      });
      success(`User ${formData.firstName} ${formData.lastName} created successfully!`, 'User Created');
    } catch (err: any) {
      error(err.message || 'Failed to create user');
    } finally {
      setCreationLoading(false);
    }
  };

  const handleUserOptions = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      gender: user.gender || 'MALE',
      address: user.address || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (editFormData.password) {
      const pwError = validatePassword(editFormData.password);
      if (pwError) { error(pwError); return; }
    }

    try {
      setEditLoading(true);
      const payload: any = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        role: editFormData.role,
        phone: editFormData.phone,
        gender: editFormData.gender,
        address: editFormData.address,
      };
      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      if (selectedUser.role === 'PATIENT' && selectedUser.patientId) {
        await api.patch(`/patients/${selectedUser.patientId}`, {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          phone: editFormData.phone,
          gender: editFormData.gender || undefined,
          address: editFormData.address || undefined,
        });
        await refreshPatients();
      } else {
        await updateUser(selectedUser.id, payload);
      }
      success(`User ${editFormData.firstName} ${editFormData.lastName} updated successfully!`);
      setShowEditModal(false);
    } catch (err: any) {
      error(err.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => {
              // Reset form with correct default role when opening modal
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: viewMode === 'patients' ? 'PATIENT' : 'STAFF',
                phone: '',
                gender: 'MALE',
                address: ''
              });
              setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-md font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/30 dark:shadow-dark-primary/30"
        >
          <Plus size={18} />
          {viewMode === 'patients' ? 'Register Patient' : 'Create Staff Member'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="col-span-1">
          <Card>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
              <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border rounded-md outline-none focus:border-primary/50 dark:focus:border-dark-primary/50 transition-all text-sm text-text-primary dark:text-dark-text-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                {viewMode !== 'patients' && (
                  <select
                    className="px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-md font-bold text-sm outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary dark:focus:ring-offset-dark-surface-secondary"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="DOCTOR">Physician</option>
                  </select>
                )}
                <button
                  onClick={() => setStatusFilter(statusFilter === '' ? 'active' : '')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-tertiary border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary rounded-md font-bold text-sm hover:bg-surface-tertiary dark:hover:bg-dark-surface-secondary transition-all focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none">
                  <Filter size={18} />
                  Status
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px] relative">
              {(viewMode === 'patients' ? patientsLoading : loading) && (
                <div className="absolute inset-0 bg-white/50 dark:bg-dark-surface-secondary/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-primary dark:text-dark-primary" size={32} />
                </div>
              )}

              {(viewMode === 'patients' ? patientsError : usersError) && (
                <div className="p-6 text-center text-red-500 dark:text-red-400 font-medium">
                  {viewMode === 'patients' ? patientsError : usersError}
                </div>
              )}

              {viewMode === 'patients' ? (
                <>
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
                        <tr key={p.id} className="group hover:bg-surface-secondary/30 dark:hover:bg-dark-surface-tertiary/30 transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-md flex items-center justify-center font-bold">
                                {p.user.firstName[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-text-primary dark:text-dark-text-primary text-sm">{p.user.firstName} {p.user.lastName}</h4>
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
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40 text-sm text-text-secondary dark:text-dark-text-secondary font-bold">{p.gender}</td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                            <span className="px-3 py-1 bg-primary-light dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Active
                            </span>
                          </td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUserOptions({
                                  id: p.user.id,
                                  patientId: p.id,
                                  firstName: p.user.firstName,
                                  lastName: p.user.lastName,
                                  email: p.user.email,
                                  phone: p.user.phone || '',
                                  role: 'PATIENT',
                                  gender: p.gender,
                                  address: p.address || '',
                                  createdAt: ''
                                })}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit User"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if(window.confirm(`Are you sure you want to archive ${p.user.firstName} ${p.user.lastName}?`)) {
                                    console.log('Archive user', p.user.id);
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Archive User"
                              >
                                <Archive size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!patientsLoading && filteredPatients.length === 0 && (
                    <div className="p-12 text-center text-text-muted dark:text-dark-text-muted-dark font-medium">
                      No patients found matching requirements.
                    </div>
                  )}
                </>
              ) : viewMode === 'staff' ? (
                <>
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="border-b border-border dark:border-dark-border">
                      <tr>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2">User</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Contact Info</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Address</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Gender</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Status</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 border-l border-border/60 dark:border-dark-border/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-dark-surface-tertiary">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="group hover:bg-surface-secondary/30 dark:hover:bg-dark-surface-tertiary/30 transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${u.role === 'ADMIN' ? 'bg-primary dark:bg-dark-primary text-white' : 'bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary'} rounded-md flex items-center justify-center font-bold`}>
                                {u.firstName[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-text-primary dark:text-dark-text-primary text-sm">{u.firstName} {u.lastName}</h4>
                                <p className="text-[10px] text-text-muted dark:text-dark-text-muted-dark font-bold uppercase tracking-wider">ID: #ST-{u.id.slice(0, 5)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                                <Mail size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                                {u.email}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                                <Phone size={12} className="text-text-muted dark:text-dark-text-muted-dark" />
                                {u.phone || 'No phone number'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40 text-xs text-text-secondary dark:text-dark-text-secondary font-medium">
                            No address
                          </td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40 text-sm text-text-secondary dark:text-dark-text-secondary font-bold">
                            N/A
                          </td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.isActive === false
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                                : 'bg-primary-light dark:bg-dark-primary/20 text-primary dark:text-dark-primary'
                            }`}>
                              {u.isActive === false ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-2 border-l border-border/40 dark:border-dark-border/40">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUserOptions(u)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit User"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                   if(window.confirm(`Are you sure you want to archive ${u.firstName} ${u.lastName}?`)) {
                                      // Placeholder for archive logic
                                      console.log('Archive user', u.id); 
                                   }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Archive User"
                              >
                                <Archive size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!loading && filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-text-muted dark:text-dark-text-muted-dark font-medium">
                      No nurse accounts found matching requirements.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <table className="w-full text-left">
                    <thead className="border-b border-border dark:border-dark-border">
                      <tr>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 w-[25%]">Name</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 w-[25%]">Email</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 w-[20%]">Phone</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 w-[15%]">Role</th>
                        <th className="pb-4 pt-2 text-xs font-bold text-text-muted dark:text-dark-text-muted-dark uppercase tracking-wider px-2 w-[15%] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-dark-surface-tertiary">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="group hover:bg-surface-secondary/30 dark:hover:bg-dark-surface-tertiary/30 transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${u.role === 'ADMIN' ? 'bg-primary dark:bg-dark-primary text-white' : 'bg-primary/10 dark:bg-dark-primary/20 text-text-primary dark:text-dark-text-primary'} rounded-full flex items-center justify-center font-bold text-xs`}>
                                {u.firstName[0]}{u.lastName[0]}
                              </div>
                              <span className="font-bold text-text-primary dark:text-dark-text-primary text-sm">{u.firstName} {u.lastName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm text-text-secondary dark:text-dark-text-secondary truncate max-w-[150px]" title={u.email}>
                            {u.email}
                          </td>
                          <td className="py-4 px-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                            {u.phone || '-'}
                          </td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wide uppercase ${
                              u.role === 'ADMIN' ? 'bg-primary/10 text-primary dark:text-dark-primary border border-primary/20' :
                              u.role === 'DOCTOR' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' :
                              'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}>
                              {formatRoleLabel(u.role)}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUserOptions(u)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit User"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if(window.confirm(`Are you sure you want to archive ${u.firstName} ${u.lastName}?`)) {
                                    // Placeholder for archive logic
                                    console.log('Archive user', u.id); 
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Archive User"
                              >
                                <Archive size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!loading && filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-text-muted dark:text-dark-text-muted-dark font-medium">
                      No users found matching requirements.
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div
            className="bg-white dark:bg-dark-surface-secondary w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
          >
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-gradient-to-r from-primary to-accent text-left">
              <h3 id="create-user-title" className="text-xl font-bold text-white">Create System User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 dark:hover:bg-white/20 rounded-md transition-colors text-white/60 focus:ring-2 focus:ring-offset-0 focus:ring-white outline-none"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-6 space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userFirstName">First Name</label>
                  <input
                    type="text"
                    id="userFirstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userLastName">Last Name</label>
                  <input
                    type="text"
                    id="userLastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userEmail">Email Address</label>
                <input
                  type="email"
                  id="userEmail"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userPassword">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    id="userPassword"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                    className="w-full px-4 py-3 pr-12 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                  <button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark hover:text-text-primary dark:hover:text-dark-text-primary transition-colors" aria-label="Toggle password visibility">
                    {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-text-muted-dark dark:text-dark-text-muted-dark pl-1">Min 8 characters, 1 uppercase, 1 lowercase, 1 number</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userRole">Role</label>
                  <select
                    id="userRole"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary appearance-none cursor-pointer"
                  >
                    {viewMode === 'patients' ? (
                       <option value="PATIENT">Patient</option>
                    ) : (
                      <>
                        <option value="STAFF">Staff</option>
                        <option value="DOCTOR">Physician</option>
                        {viewMode === 'all' && <option value="ADMIN">Admin</option>}
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userPhone">Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    id="userPhone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    onKeyDown={(e) => { if (!/[0-9+]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                    placeholder="Required"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userGender">Gender</label>
                  <select
                    id="userGender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary appearance-none cursor-pointer"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="userAddress">Address</label>
                  <input
                    type="text"
                    id="userAddress"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-surface-secondary outline-none text-text-primary dark:text-dark-text-primary"
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creationLoading}
                className="w-full py-4 bg-gray-900 dark:bg-dark-surface-tertiary text-white rounded-lg font-bold hover:bg-black dark:hover:bg-dark-surface-primary shadow-lg transition-all mt-4 flex items-center justify-center gap-2"
              >
                {creationLoading ? (
                   <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
          <div
            className="bg-white dark:bg-dark-surface-secondary w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
          >
            <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between bg-primary/5 dark:bg-dark-primary/10 text-left">
              <h3 id="edit-user-title" className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Edit System User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-surface-tertiary dark:hover:bg-dark-surface-tertiary rounded-md transition-colors text-text-muted dark:text-dark-text-muted-dark focus:ring-2 focus:ring-primary outline-none"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editFirstName">First Name</label>
                  <input
                    type="text"
                    id="editFirstName"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editLastName">Last Name</label>
                  <input
                    type="text"
                    id="editLastName"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editEmail">Email Address</label>
                <input
                  type="email"
                  id="editEmail"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editRole">User Role</label>
                <select
                  id="editRole"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  disabled={viewMode !== 'all'}
                  className={`w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none font-bold text-text-primary dark:text-dark-text-primary ${viewMode !== 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="DOCTOR">PHYSICIAN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="PATIENT">PATIENT</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editPhone">Phone Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  id="editPhone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                  onKeyDown={(e) => { if (!/[0-9+]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }}
                  className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editGender">Gender</label>
                  <select
                    id="editGender"
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary appearance-none cursor-pointer"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editAddress">Address</label>
                  <input
                    type="text"
                    id="editAddress"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest pl-1" htmlFor="editPassword">New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    id="editPassword"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 bg-surface-secondary dark:bg-dark-surface-tertiary rounded-md text-sm border-none focus:ring-2 focus:ring-primary outline-none text-text-primary dark:text-dark-text-primary"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted-dark hover:text-text-primary dark:hover:text-dark-text-primary transition-colors" aria-label="Toggle password visibility">
                    {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 bg-surface-secondary dark:bg-dark-surface-tertiary text-text-secondary dark:text-dark-text-secondary rounded-lg font-bold hover:bg-surface-tertiary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                >
                  {editLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Users;
