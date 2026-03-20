import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications,
  updateApplicationStatus,
  getCandidates,
} from '../controllers/employer.controller.js';

const router = Router();

// All routes require employer role
router.use(authenticate);
router.use(requireRole('employer'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Jobs
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/jobs/:id/applications', getJobApplications);

// Applications
router.put('/applications/:id/status', updateApplicationStatus);

// Candidates
router.get('/candidates', getCandidates);

export default router;
