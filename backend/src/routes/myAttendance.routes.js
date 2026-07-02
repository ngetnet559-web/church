import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireDatabase);
router.use(authenticate);
router.get("/", asyncHandler(attendanceController.getMyAttendance));
router.get("/upcoming", asyncHandler(attendanceController.getUpcomingSessions));
router.get("/course/:courseId", asyncHandler(attendanceController.getCourseAttendance));

export default router;
