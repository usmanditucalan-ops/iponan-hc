import { useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
}

export const useUsers = (roleFilter?: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
      const response = await api.get(url);
      setUsers(Array.isArray(response.data.users) ? response.data.users : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    try {
      const response = await api.post('/users', userData);
      await fetchUsers(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create user');
    }
  };

  const updateUser = async (id: string, userData: any) => {
    try {
      const response = await api.patch(`/users/${id}`, userData);
      await fetchUsers(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return { users, loading, error, refresh: fetchUsers, createUser, updateUser };
};
