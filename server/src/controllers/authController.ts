import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { getJwtSecret } from '../config/auth';
import { writeAuditLog } from '../services/auditLogService';
import { NotificationService } from '../services/notificationService';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role, patientData } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - strictly enforce PATIENT role for public registration
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'PATIENT', // Always PATIENT for public signup
      },
    });

    // If role is PATIENT, create patient record
    if (user.role === 'PATIENT' && patientData) {
      await prisma.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: new Date(patientData.dateOfBirth),
          gender: patientData.gender,
          address: patientData.address,
          emergencyContact: patientData.emergencyContact,
          bloodType: patientData.bloodType,
          allergies: patientData.allergies,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await writeAuditLog(req, {
        action: 'LOGIN_ATTEMPT',
        entity: 'AUTH',
        status: 'FAILED',
        details: { email, reason: 'user_not_found' },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await writeAuditLog(req, {
        action: 'LOGIN_ATTEMPT',
        userId: user.id,
        entity: 'AUTH',
        status: 'FAILED',
        details: { email, reason: 'invalid_password' },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    await writeAuditLog(req, {
      action: 'LOGIN_ATTEMPT',
      userId: user.id,
      entity: 'AUTH',
      status: 'SUCCESS',
      details: { email },
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        patient: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email only, since it's unique across all roles
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      // Simulate success for security
      return res.json({ message: 'If an account with that email exists, we have sent a reset code via SMS.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry }
    });

    if (user.phone) {
      await NotificationService.sendOtpSms(user.phone, otp);
    }
    
    res.json({ 
      message: 'If an account with that email exists, we have sent a reset code via SMS.',
      // Providing token in response for development/demo purposes as requested "end-to-end"
      // In production, this would ONLY be in the SMS.
      debugToken: otp 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify OTP (before resetting password)
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const cleanToken = token.toString().trim();
    let whereClause: any = { resetOtp: cleanToken };
    
    if (email) {
       whereClause.email = email.trim().toLowerCase();
    }

    const user = await prisma.user.findFirst({
      where: whereClause
    });

    if (!user) {
      return res.status(400).json({ error: 'wrong otp enter again' });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired (valid for 5 minutes only)' });
    }

    res.json({ message: 'OTP is valid' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password with OTP
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, email } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Code and new password are required' });
    }

    const cleanToken = token.toString().trim();

    // Find user with this exact OTP (and optional email) which has not expired
    let whereClause: any = { resetOtp: cleanToken };
    if (email) {
       whereClause.email = email.trim().toLowerCase();
    }

    const user = await prisma.user.findFirst({
      where: whereClause
    });

    if (!user) {
      return res.status(400).json({ error: 'wrong otp enter again' });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired (valid for 5 minutes only)' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password (authenticated)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
