import { Router } from 'express';
import * as courseController from '../controllers/course.controller.js';
import * as lessonController from '../controllers/lesson.controller.js';
import * as enrollmentController from '../controllers/enrollment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireDatabase);
router.use(authenticate);

router.post('/', asyncHandler(courseController.createCourse));
router.get('/', asyncHandler(courseController.getCourses));
router.get('/available', asyncHandler(courseController.getAvailableCourses));
router.get('/:id', asyncHandler(courseController.getCourseById));
router.put('/:id', asyncHandler(courseController.updateCourse));
router.delete('/:id', asyncHandler(courseController.deleteCourse));

router.post('/:id/enroll', asyncHandler(enrollmentController.enroll));
router.post('/:id/lessons', asyncHandler(lessonController.createLesson));
router.get('/:id/lessons', asyncHandler(lessonController.getLessons));

export default router;
