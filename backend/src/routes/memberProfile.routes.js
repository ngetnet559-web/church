import { Router } from "express";
import * as memberProfileController from "../controllers/memberProfile.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
const staffRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
const allRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.STUDENT,
  ROLES.PARENT,
];

router.use(requireDatabase);
router.use(authenticate);

router.get(
  "/stats",
  authorize(...staffRoles),
  asyncHandler(memberProfileController.getStatistics),
);

router.get("/me", asyncHandler(memberProfileController.getMyProfile));

router.get(
  "/",
  authorize(...staffRoles),
  asyncHandler(memberProfileController.getProfiles),
);

router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(memberProfileController.createProfile),
);

router.get("/:id", authorize(...allRoles), asyncHandler(memberProfileController.getProfile));

router.put("/:id", authorize(...allRoles), asyncHandler(memberProfileController.updateProfile));

router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(memberProfileController.deleteProfile),
);

router.post(
  "/:id/photo",
  authorize(...allRoles),
  asyncHandler(memberProfileController.uploadProfilePhoto),
);

router.post(
  "/:id/achievements",
  authorize(...allRoles),
  asyncHandler(memberProfileController.addAchievement),
);

router.delete(
  "/:id/achievements/:achievementId",
  authorize(...allRoles),
  asyncHandler(memberProfileController.removeAchievement),
);

router.post(
  "/:id/badges",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(memberProfileController.addBadge),
);

router.delete(
  "/:id/badges/:badgeId",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(memberProfileController.removeBadge),
);

export default router;
