import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';
import { writeAuditLog } from '../services/auditLogService';

// Create a new medical record
export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, chiefComplaint, diagnosis, treatment, prescription, vitalSigns, labResults, notes, attachments } = req.body;
    const userRole = req.userRole;

    // Only the general physician can create clinical records
    if (userRole !== 'DOCTOR') {
      return res.status(403).json({ error: 'Access denied. Only the General Physician can create medical records.' });
    }

    // Validate required fields
    if (!patientId || !chiefComplaint) {
      return res.status(400).json({ error: 'Patient ID and chief complaint are required' });
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ 
      where: { id: patientId },
      include: { user: true }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        chiefComplaint,
        diagnosis,
        treatment,
        prescription,
        vitalSignsJson: vitalSigns,
        labResults,
        notes,
        attachments,
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
      },
    });

    // Notify patient about new medical record via EMR Email Rule
    await NotificationService.sendEmrAvailableEmail(patient.user);

    res.status(201).json({
      message: 'Medical record created successfully',
      medicalRecord,
    });

    await writeAuditLog(req, {
      action: 'MEDICAL_RECORD_CREATE',
      entity: 'MEDICAL_RECORD',
      entityId: medicalRecord.id,
      details: { patientId },
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all medical records for a patient
export const getMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { patientId } = req.query;

    let whereClause: any = {};

    // Role-based access control
    if (userRole === 'PATIENT') {
      // Patients can only view their own records
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }
      whereClause.patientId = patient.id;
    } else if (['ADMIN', 'DOCTOR', 'STAFF'].includes(userRole || '')) {
      // Healthcare providers can view records for specific patients
      if (patientId && typeof patientId === 'string') {
        whereClause.patientId = patientId;
      }
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: whereClause,
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
      },
      orderBy: {
        visitDate: 'desc',
      },
    });

    res.json({ medicalRecords });

    await writeAuditLog(req, {
      action: 'MEDICAL_RECORD_READ',
      entity: 'MEDICAL_RECORD',
      details: { patientId: whereClause.patientId || null, count: medicalRecords.length },
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single medical record by ID
export const getMedicalRecordById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const medicalRecord = await prisma.medicalRecord.findUnique({
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
      },
    });

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    // Authorization check
    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient || medicalRecord.patientId !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (!['ADMIN', 'DOCTOR', 'STAFF'].includes(userRole || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ medicalRecord });

    await writeAuditLog(req, {
      action: 'MEDICAL_RECORD_READ',
      entity: 'MEDICAL_RECORD',
      entityId: medicalRecord.id,
      details: { patientId: medicalRecord.patientId },
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update medical record
export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(403).json({ error: 'Medical records are read-only after saving.' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get patient profile with full medical history
export const getPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    // Authorization check
    if (userRole === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient || patient.id !== patientId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (!['ADMIN', 'DOCTOR', 'STAFF'].includes(userRole || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId as string },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        medicalRecords: {
          orderBy: {
            visitDate: 'desc',
          },
        },
        vitalSigns: {
          orderBy: {
            recordedAt: 'desc',
          },
          include: {
            recordedBy: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              }
            }
          }
        },
        appointments: {
          orderBy: {
            date: 'desc',
          },
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });

    await writeAuditLog(req, {
      action: 'PATIENT_PROFILE_READ',
      entity: 'PATIENT',
      entityId: patientId as string,
      details: { medicalRecordCount: patient.medicalRecords.length },
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
