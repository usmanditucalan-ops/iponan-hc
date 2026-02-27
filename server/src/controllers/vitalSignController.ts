import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';

export const createVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      patientId, 
      bloodPressure, 
      heartRate, 
      temperature, 
      weight, 
      height, 
      respiratoryRate, 
      oxygenSaturation,
      notes 
    } = req.body;
    
    const userId = req.userId as string;

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId as string },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // At least one vital sign field must be provided
    const hasAnyVital = bloodPressure || heartRate || temperature || weight || height || respiratoryRate || oxygenSaturation;
    if (!hasAnyVital) {
      return res.status(400).json({ error: 'At least one vital sign measurement must be provided' });
    }

    const vitalSign = await prisma.vitalSign.create({
      data: {
        patientId,
        recordedById: userId,
        bloodPressure,
        heartRate: heartRate ? parseInt(heartRate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        oxygenSaturation: oxygenSaturation ? parseFloat(oxygenSaturation) : null,
        notes,
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
    });

    res.status(201).json(vitalSign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPatientVitalSigns = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.patientId as string;
    const userId = req.userId;
    const role = req.userRole;

    // Authorization check
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || patient.id !== patientId) {
        return res.status(403).json({ error: 'Unauthorized access to patient records' });
      }
    }

    const vitalSigns = await prisma.vitalSign.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      include: {
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    });

    res.json(vitalSigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getVitalSignById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const role = req.userRole;

    const vitalSign = await prisma.vitalSign.findUnique({
      where: { id },
      include: {
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        },
        patient: {
          include: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!vitalSign) {
      return res.status(404).json({ error: 'Vital sign record not found' });
    }

    // Authorization check
    if (role === 'PATIENT' && vitalSign.patient.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(vitalSign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { 
      bloodPressure, 
      heartRate, 
      temperature, 
      weight, 
      height, 
      respiratoryRate, 
      oxygenSaturation,
      notes 
    } = req.body;
    
    const role = req.userRole;

    if (role === 'PATIENT') {
      return res.status(403).json({ error: 'Patients cannot modify vital sign records' });
    }

    const vitalSign = await prisma.vitalSign.update({
      where: { id },
      data: {
        bloodPressure,
        heartRate: heartRate ? parseInt(heartRate) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
        oxygenSaturation: oxygenSaturation ? parseFloat(oxygenSaturation) : undefined,
        notes,
      },
    });

    res.json(vitalSign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
