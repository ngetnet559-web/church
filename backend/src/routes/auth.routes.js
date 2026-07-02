import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireDatabase);

router.post('/login', asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.post('/logout', authenticate, asyncHandler(authController.logout));

export default router;
