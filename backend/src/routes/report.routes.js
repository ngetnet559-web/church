import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT));

router.get("/:type", asyncHandler(reportController.getReport));

router.get("/export/csv", asyncHandler(reportController.exportReportCSV));
router.get("/export/excel", asyncHandler(reportController.exportReportExcel));
router.get("/export/pdf", asyncHandler(reportController.exportReportPDF));

export default router;
