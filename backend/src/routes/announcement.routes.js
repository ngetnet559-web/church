import { Router } from "express";
import * as announcementController from "../controllers/announcement.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/active", asyncHandler(announcementController.getActiveAnnouncements));

router.get("/", asyncHandler(announcementController.getAnnouncements));

router.get("/:id", asyncHandler(announcementController.getAnnouncementById));

router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(announcementController.createAnnouncement)
);

router.put(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(announcementController.updateAnnouncement)
);

router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(announcementController.deleteAnnouncement)
);

export default router;
