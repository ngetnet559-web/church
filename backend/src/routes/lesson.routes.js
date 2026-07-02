import { Router } from 'express';
import * as lessonController from '../controllers/lesson.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireDatabase);
router.use(authenticate);

router.put('/:id', asyncHandler(lessonController.updateLesson));
router.delete('/:id', asyncHandler(lessonController.deleteLesson));

export default router;
