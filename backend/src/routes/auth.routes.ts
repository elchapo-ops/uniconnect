import { Router } from 'express';
import { register, login, getMe, createAdminUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/setup', createAdminUser); // One-time admin setup

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
