import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create appointment (only patients can create/book appointments)
router.post('/', authorize('PATIENT'), createAppointment);

// Get all appointments (filtered by role)
router.get('/', getAppointments);

// Get single appointment
router.get('/:id', getAppointmentById);

// Update appointment (staff, admin, doctor, patient)
router.put('/:id', authorize('ADMIN', 'STAFF', 'DOCTOR', 'PATIENT'), updateAppointment);

// Cancel appointment
router.delete('/:id', cancelAppointment);

export default router;
