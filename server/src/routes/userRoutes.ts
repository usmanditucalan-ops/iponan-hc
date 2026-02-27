import express from 'express';
import { getUsers, createUser, updateUser, updateProfile, exportUsers } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Profile update is available to all authenticated users
router.patch('/profile', authenticate, updateProfile);

// Admin-only routes
router.get('/export', authenticate, authorize('ADMIN'), exportUsers);
router.get('/', authenticate, authorize('ADMIN'), getUsers);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.patch('/:id', authenticate, authorize('ADMIN'), updateUser);

export default router;
