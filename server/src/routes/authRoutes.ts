import express from 'express';
import { register, login, getProfile, forgotPassword, verifyOtp, resetPassword, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
