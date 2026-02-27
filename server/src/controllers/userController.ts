import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';
import * as bcrypt from 'bcrypt';


// Get all system users (Admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.userRole;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Authorized personnel only.' });
    }

    console.log(`getUsers called by ${userRole}. Query Role: ${req.query.role}`);


    const roleQuery = req.query.role as string | undefined;

    console.log(`getUsers called by ${userRole}. Query Role: ${roleQuery}`);



    console.log('Fetching users with query:', roleQuery ? { role: roleQuery } : {});
    
    const users = await prisma.user.findMany({
      where: roleQuery ? { role: roleQuery as any } : {},
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        language: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new system user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.userRole;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { email, password, firstName, lastName, phone, role, language } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'DOCTOR') {
      const existingDoctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' }, select: { id: true } });
      if (existingDoctor) {
        return res.status(409).json({ error: 'Only one General Physician account is allowed in this clinic.' });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || '',
        role: role as any,
        language: language || 'English',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        language: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user details or role
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, password, language, email } = req.body;
    const requesterRole = req.userRole;

    if (requesterRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (role) {
      if (role === 'DOCTOR') {
        const existingDoctor = await prisma.user.findFirst({
          where: { role: 'DOCTOR', id: { not: id as string } },
          select: { id: true },
        });
        if (existingDoctor) {
          return res.status(409).json({ error: 'Only one General Physician account is allowed in this clinic.' });
        }
      }
      updateData.role = role as any;
    }
    if (language) updateData.language = language;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check uniqueness
      const existing = await prisma.user.findFirst({ where: { email, id: { not: id as string } } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
      updateData.email = email;
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        language: true,
      },
    });

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update own profile (Authenticated)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, language } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone: phone || '',
        language: language || 'English',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        language: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export user data (Admin only)
export const exportUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { format } = req.query; // e.g., 'csv' or 'json'
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        language: true,
        createdAt: true,
      },
    });

    if (format === 'csv') {
      const header = 'ID,First Name,Last Name,Email,Phone,Role,Language,Joined\n';
      const csv = users.map((u: any) => 
        `${u.id},${u.firstName},${u.lastName},${u.email},${u.phone},${u.role},${u.language},${u.createdAt.toISOString()}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
      return res.send(header + csv);
    }

    res.json(users);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
