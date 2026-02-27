import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // For backward compatibility
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';
  language?: string;
  phone?: string;
}

interface AuthContextType {
  user: (User & { name: string }) | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserData: (newData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userState, setUserState] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUserData = (newData: Partial<User>) => {
    if (!userState) return;
    const updatedUser = { ...userState, ...newData };
    setUserState(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const user = (() => {
    if (!userState) return null;
    const firstName = userState.firstName || userState.name?.split(' ')[0] || 'User';
    const lastName = userState.lastName || (userState.name?.includes(' ') ? userState.name.split(' ').slice(1).join(' ') : '');
    const name = userState.name || `${firstName} ${lastName}`.trim();
    return { ...userState, firstName, lastName, name };
  })();

  return (
    <AuthContext.Provider value={{ 
      user: user as (User & { name: string }) | null, 
      token, 
      login, 
      logout, 
      updateUserData,
      isAuthenticated: !!token 
    }}>
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
