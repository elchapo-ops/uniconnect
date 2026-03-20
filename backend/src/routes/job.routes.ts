import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listJobs, getJobById } from '../controllers/job.controller.js';

const router = Router();

// Public routes (optionally authenticated for match scores)
router.get('/', (req, res, next) => {
  // Try to authenticate but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader) {
    authenticate(req, res, () => {
      listJobs(req, res, next);
    });
  } else {
    listJobs(req, res, next);
  }
});

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    authenticate(req, res, () => {
      getJobById(req, res, next);
    });
  } else {
    getJobById(req, res, next);
  }
});

export default router;
