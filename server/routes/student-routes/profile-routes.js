import { Router } from 'express';
import authenticate from '../../middleware/auth-middleware.js';
import { updateProfileLinks, updateBasicProfile } from '../../controllers/student-controller/profile-controller.js';
import multer from 'multer';

// Simple disk storage (temp) for avatar before Cloudinary upload
const upload = multer({ dest: 'uploads/tmp/' });

const router = Router();

// PUT /api/v1/student/update-profile
router.put('/update-profile', authenticate, updateProfileLinks);
// PUT /api/v1/student/update-basic-profile (multipart/form-data: userName + avatar file)
router.put('/update-basic-profile', authenticate, upload.single('avatar'), updateBasicProfile);

export default router;
