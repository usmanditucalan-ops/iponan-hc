import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDashboardStats, getPatientVisitsHistory } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', authenticate, getDashboardStats);
router.get('/visits-history', authenticate, authorize('ADMIN', 'STAFF', 'PATIENT'), getPatientVisitsHistory);

export default router;
