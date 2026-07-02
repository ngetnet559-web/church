import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireDatabase);
router.use(authenticate);

router.patch('/:courseId', asyncHandler(enrollmentController.updateProgress));

export default router;
