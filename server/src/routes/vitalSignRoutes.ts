import { Router } from 'express';
import { 
  createVitalSign, 
  getPatientVitalSigns, 
  getVitalSignById, 
  updateVitalSign 
} from '../controllers/vitalSignController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All vital signs routes are protected
router.use(authenticate);

router.post('/', createVitalSign);
router.get('/patient/:patientId', getPatientVitalSigns);
router.get('/:id', getVitalSignById);
router.patch('/:id', updateVitalSign);

export default router;
