import React, { useState } from 'react';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  validation?: (value: string) => boolean;
  errorMessage?: string;
  rightElement?: React.ReactNode;
  externalError?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  icon, 
  validation, 
  errorMessage, 
  rightElement,
  externalError,
  className = '',
  value,
  onChange,
  onBlur,
  type = 'text',
  ...props 
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  const isValid = validation ? validation(String(value || '')) : true;
  const showSuccess = touched && value && isValid && validation && !externalError;
  const showError = (touched && !isValid) || !!externalError;
  const displayError = externalError || errorMessage;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const getBorderColor = () => {
    if (showError) return 'border-red-500 ring-red-500/20';
    if (showSuccess) return 'border-emerald-500 ring-emerald-500/20';
    return 'border-border dark:border-white/10 focus-within:border-primary dark:focus-within:border-dark-primary focus-within:ring-2 focus-within:ring-primary/20';
  };

  const getIconColor = () => {
    if (showError) return 'text-red-500';
    if (showSuccess) return 'text-emerald-500';
    return 'text-text-muted dark:text-dark-text-muted-dark group-focus-within:text-primary';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between">
        <label className="block text-sm font-semibold text-text-primary dark:text-dark-text-primary">
          {label}
        </label>
        {showError && displayError && (
          <span className="text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-right-2">
            {displayError}
          </span>
        )}
      </div>
      
      <div className={`relative group flex items-center w-full bg-white dark:bg-[#2A2A35] border ${getBorderColor()} rounded-md px-4 py-3 transition-all duration-200 shadow-sm`}>
        {icon && (
          <div className={`shrink-0 transition-colors mr-3 ${getIconColor()}`}>
            {icon}
          </div>
        )}
        
        <input 
          type={effectiveType}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          className={`w-full bg-transparent border-none text-sm text-text-primary dark:text-gray-100 outline-none placeholder:text-text-muted dark:placeholder:text-gray-500`}
          {...props}
        />

        {/* Status Icons / Actions */}
        <div className="shrink-0 flex items-center gap-2 ml-2">
          {showSuccess && <Check size={18} className="text-emerald-500 animate-in zoom-in" />}
          {showError && <AlertCircle size={18} className="text-red-500 animate-in zoom-in" />}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-text-muted dark:text-gray-400 hover:text-primary transition-colors focus:outline-none rounded-sm hover:bg-black/5 dark:hover:bg-white/5"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {rightElement}
        </div>
      </div>
    </div>
  );
};
