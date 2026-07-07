import { Router } from "express";
import * as auditController from "../controllers/audit.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT));

router.get("/", asyncHandler(auditController.getAuditLogs));
router.get("/statistics", asyncHandler(auditController.getAuditStatistics));
router.get("/login-history", asyncHandler(auditController.getLoginHistory));
router.get("/export", asyncHandler(auditController.exportAuditLogs));

export default router;
