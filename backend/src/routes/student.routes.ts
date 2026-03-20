import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  uploadResume,
  uploadAvatar,
  getApplications,
  applyToJob,
  withdrawApplication,
  acceptApplication,
} from '../controllers/student.controller.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file field name
    const baseDir = process.env.UPLOAD_DIR || './uploads';
    if (file.fieldname === 'avatar') {
        cb(null, path.join(baseDir, 'avatars'));
    } else {
        cb(null, path.join(baseDir, 'resumes'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === 'avatar' ? 'avatar' : 'resume';
    cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WebP images are allowed'));
        }
    } else {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
  },
});

// All routes require student role
router.use(authenticate);
router.use(requireRole('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/resume', upload.single('resume'), uploadResume);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);
router.get('/applications', getApplications);
router.post('/applications', applyToJob);
router.put('/applications/:id/accept', acceptApplication);
router.delete('/applications/:id', withdrawApplication);

export default router;
