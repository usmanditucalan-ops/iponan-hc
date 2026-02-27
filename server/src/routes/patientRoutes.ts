import express from 'express';
import { getPatients, getPatientById, updatePatientProfile } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all patients (Staff, Doctor, Admin only)
router.get('/', authorize('ADMIN', 'STAFF', 'DOCTOR'), getPatients);

// Get single patient by ID
router.get('/:id', getPatientById);

// Update patient profile (Admin/Staff)
router.patch('/:id', authorize('ADMIN', 'STAFF'), updatePatientProfile);

export default router;
