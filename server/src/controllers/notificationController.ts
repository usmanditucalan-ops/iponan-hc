import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';

// Reusable helper — call from any controller to create a notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'INFO'
) => {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type },
    });
  } catch (err) {
    console.error('createNotification error:', err);
  }
};

// Notify all Admins/Staff about important events
export const notifyAdmins = async (title: string, message: string, type: string = 'INFO') => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] }
      }
    });

    await Promise.all(
      admins.map((admin: any) => 
        prisma.notification.create({
          data: { userId: admin.id, title, message, type }
        })
      )
    );
  } catch (err) {
    console.error('notifyAdmins error:', err);
  }
};

export const sendSMS = async (phone: string, message: string) => {
  console.log(`\n======================================`);
  console.log(`📱 MOCK SMS TO: ${phone}`);
  console.log(`MESSAGE: ${message}`);
  console.log(`======================================\n`);
  return true;
};

export const sendEmail = async (email: string, subject: string, body: string) => {
  console.log(`\n======================================`);
  console.log(`📧 MOCK EMAIL TO: ${email}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:\n${body}`);
  console.log(`======================================\n`);
  return true;
};


// Get notifications for current user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = req.params.id as string;
    const currentUserId = req.userId as string;

    const notification = await prisma.notification.findFirst({
      where: { 
        id: notificationId, 
        userId: currentUserId 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear all notifications
export const clearAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    await prisma.notification.deleteMany({
      where: { userId }
    });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
