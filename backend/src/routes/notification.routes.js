import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(notificationController.getNotifications));

router.get("/unread", asyncHandler(notificationController.getUnreadNotifications));

router.get("/count", asyncHandler(notificationController.getUnreadCount));

router.get("/stats", asyncHandler(notificationController.getNotificationStats));

router.delete("/", asyncHandler(notificationController.clearAllNotifications));

router.patch("/read-all", asyncHandler(notificationController.markAllAsRead));

router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

router.delete("/:id", asyncHandler(notificationController.deleteNotification));

router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  asyncHandler(notificationController.createNotification)
);

router.post(
  "/bulk",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(notificationController.createBulkNotification)
);

export default router;
