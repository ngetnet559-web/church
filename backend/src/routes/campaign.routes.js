import { Router } from "express";
import * as campaignController from "../controllers/campaign.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(requireDatabase);

router.get("/campaigns", asyncHandler(campaignController.listCampaigns));
router.get("/campaigns/:id", asyncHandler(campaignController.getCampaignById));
router.get(
  "/campaigns/:id/progress",
  asyncHandler(campaignController.getCampaignProgress),
);

router.use(authenticate);

router.post(
  "/campaigns",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(campaignController.createCampaign),
);
router.put(
  "/campaigns/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(campaignController.updateCampaign),
);
router.post(
  "/campaigns/:id/close",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(campaignController.closeCampaign),
);
router.delete(
  "/campaigns/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(campaignController.deleteCampaign),
);
router.get(
  "/campaigns/:id/analytics",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  asyncHandler(campaignController.getCampaignAnalytics),
);

export default router;
