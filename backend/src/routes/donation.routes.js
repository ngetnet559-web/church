import { Router } from "express";
import * as donationController from "../controllers/donation.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(requireDatabase);

router.post(
  "/donations",
  optionalAuthenticate,
  asyncHandler(donationController.createDonation),
);
router.get(
  "/donations/:id",
  optionalAuthenticate,
  asyncHandler(donationController.getDonationById),
);
router.get(
  "/donations/:id/receipt",
  optionalAuthenticate,
  asyncHandler(donationController.generateReceipt),
);

router.use(authenticate);

router.get(
  "/donations",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  asyncHandler(donationController.listDonations),
);
router.get(
  "/my-donations",
  authorize(ROLES.STUDENT, ROLES.PARENT, ROLES.TEACHER),
  asyncHandler(donationController.getMyDonations),
);
router.get(
  "/my-donations/statistics",
  authorize(ROLES.STUDENT, ROLES.PARENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(donationController.getDonationStatistics),
);
router.put(
  "/donations/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(donationController.updateDonation),
);
router.delete(
  "/donations/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(donationController.deleteDonation),
);
router.post(
  "/donations/:id/restore",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(donationController.restoreDonation),
);
router.post(
  "/donations/:id/refund",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(donationController.refundDonation),
);
router.post(
  "/donations/:id/approve",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(donationController.approveOfflineDonation),
);
router.get(
  "/audit-logs",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(donationController.listAuditLogs),
);

export default router;
