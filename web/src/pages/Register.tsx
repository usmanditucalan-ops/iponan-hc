import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Loader2, AlertCircle, Phone, MapPin, Lock } from 'lucide-react';
import { FormInput } from '../components/common/FormInput';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gender: '',
    birthDate: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Global Required Rule
    if (!formData.name) newErrors.name = 'This field is required';
    else if (formData.name.trim().length < 8) newErrors.name = 'Full name must be at least 8 characters long';

    if (!formData.email) newErrors.email = 'This field is required';
    if (!formData.phone) newErrors.phone = 'This field is required';
    if (!formData.address) newErrors.address = 'This field is required';
    if (!formData.gender) newErrors.gender = 'This field is required';

    // Birth Date Validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'This field is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.birthDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        newErrors.birthDate = 'Date of birth must be in the past';
      }
    }

    // Password Validation
    const pass = formData.password;
    if (!pass) {
      newErrors.password = 'This field is required';
    } else if (pass.length < 8) {
      newErrors.password = 'Must be at least 8 characters long';
    } else if (!/[A-Z]/.test(pass)) {
      newErrors.password = 'Must contain at least 1 uppercase letter';
    } else if (!/[a-z]/.test(pass)) {
      newErrors.password = 'Must contain at least 1 lowercase letter';
    } else if (!/[0-9]/.test(pass)) {
      newErrors.password = 'Must contain at least 1 number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      newErrors.password = 'Must contain at least 1 special symbol';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    setError(null);

    // Split name into first and last name for backend requirements
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '—'; // Use a dash if no last name provided

    const payload = {
      email: formData.email,
      password: formData.password,
      firstName,
      lastName,
      phone: formData.phone,
      role: 'PATIENT',
      patientData: {
        dateOfBirth: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
      }
    };

    try {
      const response = await api.post('/auth/register', payload);
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone.length >= 10;

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit} className="text-left">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type your name"
              icon={<User size={20} />}
              externalError={formErrors.name}
            />
          </div>

          <div className="space-y-4">
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Type your email"
              icon={<Mail size={20} />}
              validation={validateEmail}
              errorMessage="Invalid email address"
              externalError={formErrors.email}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({...formData, phone: e.target.value.replace(/[^0-9+]/g, '')});
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                }}
                placeholder="Type phone"
                icon={<Phone size={20} />}
                validation={validatePhone}
                errorMessage="Min 10 digits"
                externalError={formErrors.phone}
              />
            </div>
            <div className="space-y-4">
              <FormInput
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                externalError={formErrors.birthDate}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="block text-sm font-semibold text-text-primary dark:text-dark-text-primary">Gender</label>
              {formErrors.gender && (
                <span className="text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-right-2">
                  {formErrors.gender}
                </span>
              )}
            </div>
            <div className="flex gap-4">
              {['MALE', 'FEMALE'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, gender: g });
                    if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                    formData.gender === g 
                      ? 'border-primary bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary' 
                      : 'border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted-dark hover:border-text-muted dark:hover:border-dark-text-muted-dark'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <FormInput
              label="Residential Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Type your address"
              icon={<MapPin size={20} />}
              externalError={formErrors.address}
            />
          </div>

          <div className="space-y-4">
            <FormInput
              label="Secure Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Type your password"
              icon={<Lock size={20} />}
              externalError={formErrors.password}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-[#00dbde] to-[#fc00ff] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 mb-5"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Register'}
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-2 uppercase tracking-wider">Already have an account?</p>
          <Link to="/login" className="text-sm font-bold text-text-primary dark:text-dark-text-primary hover:text-primary transition-colors uppercase tracking-wider">Login</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
