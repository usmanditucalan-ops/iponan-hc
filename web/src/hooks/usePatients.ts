import { useState, useEffect } from 'react';
import api from '../services/api';

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bloodType?: string;
  allergies?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  lastVitalDate?: string;
}

export const usePatients = (searchQuery?: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const url = searchQuery ? `/patients?search=${searchQuery}` : '/patients';
      const response = await api.get(url);
      setPatients(Array.isArray(response.data.patients) ? response.data.patients : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const registerPatient = async (patientData: any) => {
    try {
      // Registration is handled via the auth endpoint for now
      // as it creates both a User and a Patient record.
      const response = await api.post('/auth/register', patientData);
      await fetchPatients(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to register patient');
    }
  };

  const updatePatient = async (id: string, payload: any) => {
    try {
      const response = await api.patch(`/patients/${id}`, payload);
      await fetchPatients();
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update patient profile');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  return { patients, loading, error, refresh: fetchPatients, registerPatient, updatePatient };
};
