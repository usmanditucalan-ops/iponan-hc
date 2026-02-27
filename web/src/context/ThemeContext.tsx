import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  userPreference: Theme;
  systemPreference: 'light' | 'dark';
  setUserPreference: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userPreference, setUserPreferenceState] = useState<Theme>('system');
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Detect system preference on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load user preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('theme-preference') as Theme | null;
    if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
      setUserPreferenceState(savedPreference);
    } else {
      setUserPreferenceState('system');
    }
    setIsHydrated(true);
  }, []);

  // Determine actual theme to use (user preference OR system preference)
  useEffect(() => {
    if (!isHydrated) return;

    const actualTheme = userPreference === 'system' ? systemPreference : userPreference;
    setTheme(actualTheme);

    // Apply to DOM
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [userPreference, systemPreference, isHydrated]);

  const handleSetUserPreference = (newPreference: Theme) => {
    setUserPreferenceState(newPreference);
    localStorage.setItem('theme-preference', newPreference);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        userPreference,
        systemPreference,
        setUserPreference: handleSetUserPreference,
        toggleTheme: () => handleSetUserPreference(theme === 'dark' ? 'light' : 'dark'),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
