import express from 'express';
import {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  getPatientProfile,
} from '../controllers/medicalRecordController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create medical record (general physician only)
router.post('/', authorize('DOCTOR'), createMedicalRecord);

// Get all medical records (filtered by role)
router.get('/', getMedicalRecords);

// Get patient profile with full medical history
router.get('/patient/:patientId', getPatientProfile);

// Get single medical record
router.get('/:id', getMedicalRecordById);

// Update medical record (general physician only)
router.put('/:id', authorize('DOCTOR'), updateMedicalRecord);

export default router;
