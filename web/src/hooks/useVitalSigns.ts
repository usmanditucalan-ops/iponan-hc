import { useState, useCallback } from 'react';
import api from '../services/api';

export interface VitalSign {
  id: string;
  patientId: string;
  recordedById: string;
  recordedAt: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  notes?: string;
  recordedBy: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const useVitalSigns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientVitalSigns = useCallback(async (patientId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/vital-signs/patient/${patientId}`);
      setError(null);
      return response.data as VitalSign[];
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch vital signs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createVitalSign = async (data: any) => {
    try {
      setLoading(true);
      const response = await api.post('/vital-signs', data);
      setError(null);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to record vital signs';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateVitalSign = async (id: string, data: any) => {
    try {
      setLoading(true);
      const response = await api.patch(`/vital-signs/${id}`, data);
      setError(null);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update vital signs';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchPatientVitalSigns, createVitalSign, updateVitalSign };
};
