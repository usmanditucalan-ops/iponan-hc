import { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';

export const useAppointments = (date?: string) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const queryDate = date || format(new Date(), 'yyyy-MM-dd');
      const response = await api.get(`/appointments?date=${queryDate}`);
      setAppointments(Array.isArray(response.data.appointments) ? response.data.appointments : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return { appointments, loading, error, refresh: fetchAppointments };
};
