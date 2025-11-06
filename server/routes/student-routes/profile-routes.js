import { Router } from 'express';
import authenticate from '../../middleware/auth-middleware.js';
import { updateProfileLinks } from '../../controllers/student-controller/profile-controller.js';

const router = Router();

// PUT /api/v1/student/update-profile
router.put('/update-profile', authenticate, updateProfileLinks);

export default router;
