import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormInput } from '../components/common/FormInput';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'This field is required';
    if (!password) newErrors.password = 'This field is required';

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Forgot Password Methods ---
  const handleForgotClose = () => {
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
  };

  const validatePassword = (pwd: string) => {
    // 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      return;
    }
    setForgotError(null);
    setIsForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStep('otp');
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp) {
      setForgotError('Please enter the OTP.');
      return;
    }
    setForgotError(null);
    setIsForgotLoading(true);
    try {
      await api.post('/auth/verify-otp', {
        email: forgotEmail,
        token: forgotOtp
      });
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Failed to verify OTP.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setForgotError('Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      return;
    }

    setIsForgotLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        token: forgotOtp,
        newPassword
      });
      setForgotStep('success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password.';
      setForgotError(errorMsg);
      if (errorMsg.toLowerCase().includes('wrong otp')) {
        setForgotStep('otp');
      }
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="text-left">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-6 mb-4">
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
            }}
            placeholder="Type your email"
            icon={<Mail size={20} />}
            externalError={formErrors.email}
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
            }}
            placeholder="Type your password"
            icon={<Lock size={20} />}
            externalError={formErrors.password}
            required
          />
        </div>

        <div className="flex justify-end mb-5">
          <button 
            type="button" 
            onClick={() => setShowForgotModal(true)}
            className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-[#00dbde] to-[#fc00ff] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 mb-10"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Login'}
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-2">Don't have an account?</p>
          <Link to="/register" className="text-sm font-bold text-text-primary dark:text-dark-text-primary hover:text-primary transition-colors uppercase tracking-wider">Sign Up</Link>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleForgotClose}
                className="p-1 text-text-tertiary hover:text-text-primary dark:text-text-muted-dark dark:hover:text-dark-text-primary bg-surface/50 dark:bg-dark-bg/50 hover:bg-surface dark:hover:bg-dark-bg rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2 text-center">Reset Password</h2>
              
              {forgotStep === 'email' && (
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6 text-center">
                  Enter your email address and we'll send a verification code to your registered mobile number.
                </p>
              )}
              {forgotStep === 'otp' && (
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6 text-center">
                  Enter the 6-digit code sent via SMS.
                </p>
              )}
              {forgotStep === 'reset' && (
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-6 text-center">
                  Create a new strong password for your account.
                </p>
              )}

              {forgotError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold">{forgotError}</p>
                </div>
              )}

              {forgotStep === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    icon={<Mail size={20} />}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isForgotLoading}
                    className="w-full h-12 bg-gradient-to-r from-[#00dbde] to-[#fc00ff] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isForgotLoading ? <Loader2 size={20} className="animate-spin" /> : 'Send OTP'}
                  </button>
                </form>
              )}

              {forgotStep === 'otp' && (
                <form onSubmit={handleConfirmOtp} className="space-y-6">
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={forgotEmail}
                    onChange={() => {}}
                    icon={<Mail size={20} />}
                    disabled
                  />
                  <FormInput
                    label="Verification Code Sent to Registered SMS (OTP)"
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    icon={<Lock size={20} />}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isForgotLoading}
                    className="w-full h-12 bg-gradient-to-r from-[#00dbde] to-[#fc00ff] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isForgotLoading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm'}
                  </button>
                </form>
              )}

              {forgotStep === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <FormInput
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    icon={<Lock size={20} />}
                    required
                  />
                  <FormInput
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    icon={<Lock size={20} />}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isForgotLoading}
                    className="w-full h-12 bg-gradient-to-r from-[#00dbde] to-[#fc00ff] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isForgotLoading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                  </button>
                </form>
              )}

              {forgotStep === 'success' && (
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Password Reset!</h3>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-8">
                    Your password has been successfully updated. You can now login with your new credentials.
                  </p>
                  <button 
                    onClick={handleForgotClose}
                    className="w-full h-12 bg-gradient-to-r from-[#00dbde] to-[#fc00ff] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </AuthLayout>
  );
};

export default Login;
