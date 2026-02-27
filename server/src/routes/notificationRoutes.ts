import express from 'express';
import { getNotifications, markAsRead, clearAll } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/clear', clearAll);

export default router;
