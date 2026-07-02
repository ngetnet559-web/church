import { Router } from "express";
import * as certificateController from "../controllers/certificate.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireDatabase);
router.use(authenticate);
router.get("/", asyncHandler(certificateController.getMyCertificates));

export default router;
