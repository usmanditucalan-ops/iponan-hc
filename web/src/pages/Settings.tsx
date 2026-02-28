import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Bell, Lock, Camera, Loader2, X, Moon, Sun } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { Card } from '../components/ui/Card';

const Settings = () => {
  const { user, updateUserData } = useAuth();
  const { theme, setUserPreference } = useTheme();
  const { success, error, info } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    channels: true,
    appointments: true,
    consultation: true,
    testResult: true,
    loginAlerts: true,
  });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    language: user?.language || 'English',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    info('Profile photo removed');
  };

  const handleSaveAll = async () => {
    try {
      setIsLoading(true);
      await api.patch('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        language: formData.language,
      });
      updateUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        language: formData.language,
      });
      success('Your profile has been updated successfully!', 'Profile Updated');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return error('New passwords do not match');
    }

    try {
      setIsLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      language: user?.language || 'English',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    info('Changes have been discarded');
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">Profile Settings</h3>

            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary rounded-full flex items-center justify-center text-3xl font-bold border border-border dark:border-dark-border">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user?.firstName?.[0]
                  )}
                </div>
                <input
                  type="file"
                  id="photoInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('photoInput')?.click()}
                  className="absolute -bottom-1 -right-1 p-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md shadow-md hover:bg-black dark:hover:bg-gray-600 transition-all"
                  aria-label="Change profile photo"
                >
                  <Camera size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('photoInput')?.click()}
                className="mt-2 text-sm font-medium text-primary dark:text-dark-primary hover:underline"
              >
                Upload photo
              </button>
              {photoFile && (
                <p className="text-xs text-text-muted dark:text-dark-text-muted-dark mt-1">{photoFile.name}</p>
              )}
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block px-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block px-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block px-1">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                    className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block px-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none opacity-60 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border dark:border-dark-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-4 py-2.5 text-text-secondary dark:text-dark-text-secondary font-bold text-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary rounded-md transition-all"
                >
                  Remove Photo
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-2.5 text-text-secondary dark:text-dark-text-secondary font-bold text-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary rounded-md transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">Account & Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-md">
                <div>
                  <p className="font-bold text-text-primary dark:text-dark-text-primary">Password</p>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">Change password for account security</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                >
                  Change Password
                </button>
              </div>

            </div>
          </Card>

          <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-primary/20 bg-primary/5 dark:bg-dark-primary/5">
            <div>
              <p className="font-bold text-text-primary dark:text-dark-text-primary">Confirm to apply new settings</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">Please review your information before submitting.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-4 py-2.5 text-text-secondary dark:text-dark-text-secondary font-bold text-sm hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary rounded-md transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-md font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin text-white" size={16} /> : null}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-text-muted dark:text-dark-text-muted-dark" />
              <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Notification Settings</h3>
            </div>

            <div className="space-y-3">
              {[
                { key: 'channels', label: 'Notification Channels', hint: 'Email & SMS' },
                { key: 'appointments', label: 'Appointments', hint: 'Appointment updates and reminders' },
                { key: 'consultation', label: 'Consultation', hint: 'Consultation workflow alerts' },
                { key: 'testResult', label: 'Test Result', hint: 'Lab and result alerts' },
                { key: 'loginAlerts', label: 'Login Alerts', hint: 'Notify on new/unfamiliar logins' },
              ].map((item) => {
                const value = notificationPrefs[item.key as keyof typeof notificationPrefs];
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-surface-secondary dark:bg-dark-surface-secondary rounded-md">
                    <div>
                      <p className="font-medium text-text-primary dark:text-dark-text-primary">{item.label}</p>
                      <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">{item.hint}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label}`}
                      onClick={() =>
                        setNotificationPrefs((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof prev],
                        }))
                      }
                      className={`w-12 h-6 rounded-full relative transition-colors ${value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`absolute left-0.5 top-1/2 w-5 h-5 -translate-y-1/2 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">Theme Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-md">
                <div>
                  <p className="font-bold text-text-primary dark:text-dark-text-primary">Dark Mode</p>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted-dark">Use dark appearance for all pages</p>
                </div>
                <button
                  type="button"
                  aria-label="Toggle Dark Mode"
                  onClick={() => setUserPreference(theme === 'dark' ? 'light' : 'dark')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`absolute left-0.5 top-1/2 w-5 h-5 -translate-y-1/2 rounded-full bg-white transition-transform duration-200 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="p-4 bg-surface-secondary dark:bg-dark-surface-secondary rounded-md">
                <div className="flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                  {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  <p className="font-medium text-sm">Current mode: {theme === 'dark' ? 'Dark' : 'Light'}</p>
                </div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted-dark mt-1">
                  You can also toggle this from the header at any time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>


      {showPasswordModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-surface-primary w-full max-w-md rounded-lg shadow-2xl border border-border dark:border-dark-border overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-tertiary rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 pt-2 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted-dark dark:text-dark-text-muted-dark uppercase tracking-widest mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-md outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-text-secondary hover:bg-surface-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-md hover:opacity-90 transition-all shadow-md shadow-primary/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin text-white" size={18} /> : <Lock size={16} />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
