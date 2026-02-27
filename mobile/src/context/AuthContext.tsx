import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';
  patientId?: string;
  language?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Refresh profile to get latest patient ID if missing
        try {
          const response = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (response.data.user) {
            const updatedUser = {
              ...parsedUser,
              patientId: response.data.user.patient?.id
            };
            setUser(updatedUser);
            await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
          }
        } catch (profileErr) {
          console.error('Failed to refresh profile', profileErr);
        }
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: any) => {
    // Fetch profile to get patientId if it's a patient
    let finalUser = { ...newUser };
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      if (response.data.user?.patient) {
        finalUser.patientId = response.data.user.patient.id;
      }
    } catch (e) {
      console.error('Could not fetch patient profile during login');
    }

    setToken(newToken);
    setUser(finalUser);
    await SecureStore.setItemAsync('token', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(finalUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.get('/auth/profile');
      if (response.data.user) {
        // Merge with existing user to keep fields like token if needed, 
        // though usually profile returns full user object.
        const updatedUser = { ...user, ...response.data.user };
        
        // Ensure patientId is preserved or updated
        if (updatedUser.patient) {
            updatedUser.patientId = updatedUser.patient.id;
        }

        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Failed to refresh user profile', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
