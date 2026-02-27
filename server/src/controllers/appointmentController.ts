import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';
import { createNotification, notifyAdmins } from './notificationController';
import { NotificationService } from '../services/notificationService';
import { writeAuditLog } from '../services/auditLogService';

const GENERAL_CONSULTATION_LABEL = 'General Consultation - Barangay Health Clinic';

const getGeneralPhysician = async () => {
  return prisma.user.findFirst({
    where: { role: 'DOCTOR' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
};

// Create a new appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, date, time, reason, notes } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!patientId || !date || !time || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Reject past dates
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ error: 'Cannot book an appointment in the past' });
    }

    // Check for duplicate booking on same date for this patient
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
    });
    if (existingAppointment) {
      return res.status(400).json({ error: 'Patient already has an appointment on this date' });
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ 
      where: { id: patientId },
      include: { user: true }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // If user is a patient, ensure they can only book for themselves
    if (req.userRole === 'PATIENT') {
      const userPatient = await prisma.patient.findUnique({ where: { userId } });
      if (!userPatient || userPatient.id !== patientId) {
        return res.status(403).json({ error: 'You can only book appointments for yourself' });
      }
    }

    const generalPhysician = await getGeneralPhysician();
    if (!generalPhysician) {
      return res.status(503).json({ error: 'General physician account is not configured' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: generalPhysician.id,
        date: new Date(date),
        time,
        reason,
        notes,
        status: 'PENDING',
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Notify patient about appointment request
    const shortSummary = `Clinic: Your appointment request at the Barangay Health Clinic for ${appointmentDate.toLocaleDateString()} ${time} was received.`;
    await createNotification(
      patient.userId,
      'Appointment Requested',
      shortSummary,
      'APPOINTMENT'
    );

    // SMS & Email to Patient
    const p = patient.user;
    await NotificationService.sendAppointmentCreated(p, appointment);

    // Notify Admins
    await notifyAdmins(
      'New Appointment Booked',
      `${p.firstName} ${p.lastName} booked an appointment for ${appointmentDate.toLocaleDateString()} at ${time}.`,
      'APPOINTMENT'
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });

    await writeAuditLog(req, {
      action: 'APPOINTMENT_CREATE',
      entity: 'APPOINTMENT',
      entityId: appointment.id,
      details: { patientId, date, time, status: appointment.status },
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all appointments (with filters)
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { status, date, patientId } = req.query;

    let whereClause: any = {};

    // Role-based filtering
    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }
      whereClause.patientId = patient.id;
    } else if (userRole === 'DOCTOR') {
      whereClause.doctorId = userId;
    }

    // Additional filters
    if (status && typeof status === 'string') whereClause.status = status;
    if (date && typeof date === 'string') whereClause.date = new Date(date);
    if (patientId && typeof patientId === 'string') whereClause.patientId = patientId;

    console.log(`getAppointments for ${userRole} (${userId}). Filters:`, whereClause);

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single appointment by ID
export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const appointment = await prisma.appointment.findUnique({
      where: { id: id as string },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Authorization check
    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient || appointment.patientId !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update appointment
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time, reason, notes, status } = req.body;
    const userRole = req.userRole;
    const userId = req.userId;

    const appointment = await prisma.appointment.findUnique({ where: { id: id as string } });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Role-based Update Logic
    let updateData: any = {};

    if (userRole === 'PATIENT') {
       // Patients can only modify their own appointments
       const patient = await prisma.patient.findUnique({ where: { userId } });
       if (!patient || appointment.patientId !== patient.id) {
         return res.status(403).json({ error: 'Access denied' });
       }
       if (appointment.status === 'CONFIRMED') {
         return res.status(403).json({ error: 'Confirmed appointments are locked for patient edits.' });
       }
       
       if (date || time) {
         // Reschedule request -> Force PENDING
         if (date) updateData.date = new Date(date);
         if (time) updateData.time = time;
         updateData.status = 'PENDING'; 
       }
       
       if (reason !== undefined) updateData.reason = reason;
       if (notes !== undefined) updateData.notes = notes;
       if (status === 'CANCELLED') updateData.status = 'CANCELLED';
       
       if (Object.keys(updateData).length === 0) {
         return res.status(400).json({ error: 'No update data provided' });
       }
    } else if (userRole === 'DOCTOR') {
      // Doctors can only mark as COMPLETED and add notes
      if (status === 'COMPLETED') {
        updateData.status = 'COMPLETED';
        updateData.notes = notes; // Allow adding notes
      } else {
         return res.status(403).json({ error: 'Doctors can only mark appointments as Completed' });
      }
    } else if (userRole === 'ADMIN') {
      if (date) updateData.date = new Date(date);
      if (time) updateData.time = time;
      if (reason) updateData.reason = reason;
      if (notes) updateData.notes = notes;
      if (status) updateData.status = status;
      if (status === 'CONFIRMED' && !appointment.doctorId) {
        const generalPhysician = await getGeneralPhysician();
        if (!generalPhysician) {
          return res.status(503).json({ error: 'General physician account is not configured' });
        }
        updateData.doctorId = generalPhysician.id;
      }
    } else if (userRole === 'STAFF') {
      if (notes !== undefined) updateData.notes = notes;
      if (status) updateData.status = status;
      if (status === 'CONFIRMED' && !appointment.doctorId) {
        const generalPhysician = await getGeneralPhysician();
        if (!generalPhysician) {
          return res.status(503).json({ error: 'General physician account is not configured' });
        }
        updateData.doctorId = generalPhysician.id;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Staff can only update appointment status or notes' });
      }
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id as string },
      data: updateData,
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // If status changed to confirmed, rescheduled, or cancelled(rejected)
    if (status && status !== appointment.status && ['CONFIRMED', 'RESCHEDULED', 'CANCELLED'].includes(status)) {
      const p = updatedAppointment.patient.user;
      
      let actionText = 'updated';
      let smsAction = 'is updated';
      if (status === 'CONFIRMED') { actionText = 'approved'; smsAction = 'is approved'; }
      if (status === 'RESCHEDULED') { actionText = 'rescheduled'; smsAction = 'is rescheduled'; }
      if (status === 'CANCELLED') { actionText = 'rejected/cancelled'; smsAction = 'is rejected'; }

      const shortSummary = `Clinic: Your appointment at the Barangay Health Clinic on ${updatedAppointment.date.toLocaleDateString()} ${smsAction}.`;
      
      // In-app notification
      await createNotification(
        p.id,
        `Appointment ${status}`,
        shortSummary,
        'APPOINTMENT'
      );

      // SMS & Email via NotificationService
      if (status === 'CONFIRMED') {
        await NotificationService.sendAppointmentConfirmed(p, updatedAppointment);
      } else if (status === 'RESCHEDULED') {
        await NotificationService.sendAppointmentRescheduled(p, appointment, updatedAppointment);
      } else if (status === 'CANCELLED') {
        await NotificationService.sendAppointmentCancelled(p, updatedAppointment);
      }
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment,
    });

    await writeAuditLog(req, {
      action: 'APPOINTMENT_UPDATE',
      entity: 'APPOINTMENT',
      entityId: updatedAppointment.id,
      details: {
        statusFrom: appointment.status,
        statusTo: updatedAppointment.status,
        notesUpdated: notes !== undefined,
        rejectionReason:
          typeof updateData.notes === 'string'
            ? (updateData.notes.match(/REJECTION_REASON:\s*(.*)/)?.[1] ?? null)
            : null,
      },
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel appointment
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const appointment = await prisma.appointment.findUnique({ where: { id: id as string } });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Role-based Cancellation Logic
    if (userRole === 'DOCTOR') {
      return res.status(403).json({ error: 'Doctors cannot cancel appointments. Please contact an Admin.' });
    }

    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient || appointment.patientId !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (appointment.status === 'CONFIRMED') {
        return res.status(403).json({ error: 'Confirmed appointments cannot be cancelled by patient.' });
      }
    } else if (!['ADMIN', 'STAFF'].includes(userRole || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cancelledAppointment = await prisma.appointment.update({
      where: { id: id as string },
      data: { status: 'CANCELLED' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
           select: {
             firstName: true,
             lastName: true,
             email: true,
           }
        }
      },
    });

    // Notify involved parties
    const shortSummary = `Clinic: Your appointment for ${appointment.date.toLocaleDateString()} at ${appointment.time} has been cancelled.`;
    await createNotification(
      cancelledAppointment.patient.userId,
      'Appointment Cancelled',
      shortSummary,
      'APPOINTMENT'
    );

    // SMS & Email to Patient
    const p = cancelledAppointment.patient.user;
    await NotificationService.sendAppointmentCancelled(p, cancelledAppointment);
     
    // Notify Admins about patient cancellation
    if (userRole === 'PATIENT') {
       await notifyAdmins(
          'Appointment Cancelled by Patient',
          `${p.firstName} ${p.lastName} cancelled their appointment on ${appointment.date.toLocaleDateString()}.`,
          'APPOINTMENT'
       );
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment,
    });

    await writeAuditLog(req, {
      action: 'APPOINTMENT_CANCEL',
      entity: 'APPOINTMENT',
      entityId: cancelledAppointment.id,
      details: { statusTo: 'CANCELLED' },
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
