import { useState, useEffect } from 'react';
import api from '../services/api';

export interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  vitalSignsJson?: any;
  labResults?: string;
  attachments?: any[]; // Metadata array
  notes?: string;
  patient?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export const useMedicalRecords = (patientId?: string) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const url = patientId ? `/medical-records?patientId=${patientId}` : '/medical-records';
      const response = await api.get(url);
      setRecords(Array.isArray(response.data.medicalRecords) ? response.data.medicalRecords : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (recordData: any) => {
    try {
      const response = await api.post('/medical-records', recordData);
      await fetchRecords(); // Refresh list
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create medical record');
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  return { records, loading, error, refresh: fetchRecords, createRecord };
};
