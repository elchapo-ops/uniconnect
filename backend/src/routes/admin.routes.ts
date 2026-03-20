import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getStudents,
  getEmployers,
  verifyEmployer,
  deleteUser,
  getAnalytics,
} from '../controllers/admin.controller.js';

const router = Router();

// All routes require admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Students
router.get('/students', getStudents);

// Employers
router.get('/employers', getEmployers);
router.put('/employers/:id/verify', verifyEmployer);

// Users
router.delete('/users/:id', deleteUser);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
