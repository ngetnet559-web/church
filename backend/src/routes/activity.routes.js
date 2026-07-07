import { Router } from "express";
import * as activityController from "../controllers/activity.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(activityController.getActivities));
router.get("/recent", asyncHandler(activityController.getRecentActivities));
router.get("/timeline", asyncHandler(activityController.getActivityTimeline));
router.get("/stats", asyncHandler(activityController.getActivityStats));

export default router;
