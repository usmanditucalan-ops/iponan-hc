import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  userPreference: ThemePreference;
  setUserPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useNativeColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [userPreference, setUserPreferenceState] = useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadPref = async () => {
      try {
        const saved = await SecureStore.getItemAsync('theme-preference');
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setUserPreferenceState(saved as ThemePreference);
        }
      } catch {}
      setIsHydrated(true);
    };
    loadPref();
  }, []);

  const setUserPreference = async (pref: ThemePreference) => {
    setUserPreferenceState(pref);
    try {
      await SecureStore.setItemAsync('theme-preference', pref);
    } catch {}
  };

  const resolvedTheme: 'light' | 'dark' = 
    userPreference === 'system' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light') 
      : userPreference;

  // Sync with NativeWind
  useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setUserPreference(newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme: resolvedTheme,
      isDark: resolvedTheme === 'dark',
      userPreference,
      setUserPreference,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
