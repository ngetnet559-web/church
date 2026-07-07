import { Router } from "express";
import * as certificateController from "../controllers/certificate.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(requireDatabase);
router.get(
  "/verify/:verificationCode",
  asyncHandler(certificateController.verifyCertificate),
);
router.use(authenticate);

router.get(
  "/download-requests",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(certificateController.getDownloadRequests),
);

router.patch(
  "/download-requests/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(certificateController.reviewDownloadRequest),
);

router.get(
  "/stats",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  asyncHandler(certificateController.getCertificateStats),
);

router.get("/", asyncHandler(certificateController.getMyCertificates));
router.get("/:id", asyncHandler(certificateController.getCertificateById));
router.get("/:id/preview", asyncHandler(certificateController.getCertificatePreview));
router.post(
  "/:id/download-request",
  asyncHandler(certificateController.requestDownload),
);
router.get(
  "/:id/download",
  asyncHandler(certificateController.downloadCertificate),
);

export default router;