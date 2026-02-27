import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';

// Get all patients (Admin, Doctor, Nurse, Staff only)
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.userRole;

    if (!['ADMIN', 'DOCTOR', 'STAFF'].includes(userRole || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { search } = req.query;

    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
          { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } },
        ]
      } : {},
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
          select: { recordedAt: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const patientsWithLastVital = patients.map((p: any) => ({
        ...p,
        lastVitalDate: p.vitalSigns[0]?.recordedAt || null,
        vitalSigns: undefined // Clean up response
    }));

    res.json({ patients: patientsWithLastVital });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get patient by search ID or other identifiers
export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: id as string },
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
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update patient profile (Admin, Staff)
export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.userRole;
    if (!['ADMIN', 'STAFF'].includes(userRole || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      bloodType,
      allergies,
    } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { id: id as string },
      include: { user: { select: { id: true } } },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const userData: any = {};
    if (firstName !== undefined) userData.firstName = firstName;
    if (lastName !== undefined) userData.lastName = lastName;
    if (email !== undefined) userData.email = email;
    if (phone !== undefined) userData.phone = phone;

    const patientData: any = {};
    if (gender !== undefined) patientData.gender = gender;
    if (dateOfBirth !== undefined) patientData.dateOfBirth = new Date(dateOfBirth);
    if (address !== undefined) patientData.address = address;
    if (bloodType !== undefined) patientData.bloodType = bloodType;
    if (allergies !== undefined) patientData.allergies = allergies;

    await prisma.$transaction(async (tx: any) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: patient.user.id },
          data: userData,
        });
      }

      if (Object.keys(patientData).length > 0) {
        await tx.patient.update({
          where: { id: id as string },
          data: patientData,
        });
      }
    });

    const updatedPatient = await prisma.patient.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    return res.json({
      message: 'Patient profile updated successfully',
      patient: updatedPatient,
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    console.error('Update patient profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
