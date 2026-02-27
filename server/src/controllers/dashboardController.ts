import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  format
} from 'date-fns';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    // Different stats based on role
    if (userRole === 'PATIENT') {
      // Patient stats
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      const totalAppointments = await prisma.appointment.count({ where: { patientId: patient.id } });
      const pendingAppointments = await prisma.appointment.count({ 
        where: { patientId: patient.id, status: 'PENDING' } 
      });
      const medicalRecords = await prisma.medicalRecord.count({ where: { patientId: patient.id } });

      return res.json({
        stats: [
          { label: 'My Appointments', value: totalAppointments.toString(), trend: 'total' },
          { label: 'Pending Visits', value: pendingAppointments.toString(), trend: 'today' },
          { label: 'Medical Records', value: medicalRecords.toString(), trend: 'available' }
        ]
      });
    }

    // Provider/Admin stats (General Physician, Staff, Admin)
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    const [
      totalPatients,
      appointmentsToday,
      totalRecords,
      pendingCount
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({
        where: {
          date: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.medicalRecord.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      totalPatients,
      appointmentsToday,
      totalRecords,
      pendingCount,
      // Mocked trends for UI
      trends: {
        patients: '+12%',
        appointments: `+${appointmentsToday} today`,
        records: '+8%',
        wait: '18 min'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getPatientVisitsHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRole || !['ADMIN', 'STAFF', 'PATIENT'].includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userRole = req.userRole;
    const userId = req.userId;
    const range = req.query.range === 'weekly' || req.query.range === 'monthly' ? req.query.range : 'daily';
    const today = new Date();
    const pastStatuses = ['CONFIRMED', 'COMPLETED', 'RESCHEDULED'];
    let patientFilter: any = {};

    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      patientFilter.patientId = patient.id;
    }

    const buildBucket = async (periodStart: Date, periodEnd: Date, label: string, fullLabel: string) => {
      const [visits, completed, cancelled] = await Promise.all([
        prisma.appointment.count({
          where: {
            ...patientFilter,
            date: { gte: periodStart, lte: periodEnd },
            status: { in: pastStatuses as any }
          }
        }),
        prisma.appointment.count({
          where: {
            ...patientFilter,
            date: { gte: periodStart, lte: periodEnd },
            status: 'COMPLETED'
          }
        }),
        prisma.appointment.count({
          where: {
            ...patientFilter,
            date: { gte: periodStart, lte: periodEnd },
            status: 'CANCELLED'
          }
        })
      ]);

      return { label, fullLabel, visits, completed, cancelled };
    };

    if (range === 'daily') {
      const buckets = await Promise.all(
        Array.from({ length: 7 }, (_, idx) => {
          const daysAgo = 7 - idx;
          const date = subDays(today, daysAgo);
          return buildBucket(startOfDay(date), endOfDay(date), format(date, 'EEE'), format(date, 'MMM d'));
        })
      );
      return res.json({ range, buckets });
    }

    if (range === 'weekly') {
      const buckets = await Promise.all(
        Array.from({ length: 8 }, (_, idx) => {
          const weeksAgo = 8 - idx;
          const weekDate = subWeeks(today, weeksAgo);
          const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
          return buildBucket(
            weekStart,
            weekEnd,
            `W${idx + 1}`,
            `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
          );
        })
      );
      return res.json({ range, buckets });
    }

    const buckets = await Promise.all(
      Array.from({ length: 6 }, (_, idx) => {
        const monthsAgo = 6 - idx;
        const monthDate = subMonths(today, monthsAgo);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        return buildBucket(monthStart, monthEnd, format(monthDate, 'MMM'), format(monthDate, 'MMMM yyyy'));
      })
    );
    return res.json({ range, buckets });
  } catch (error) {
    console.error('Error fetching patient visits history:', error);
    return res.status(500).json({ error: 'Failed to fetch patient visits history' });
  }
};
