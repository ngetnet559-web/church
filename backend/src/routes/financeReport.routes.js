import { Router } from "express";
import * as financeReportController from "../controllers/financeReport.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(requireDatabase);
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get("/reports/dashboard", asyncHandler(financeReportController.getDashboard));
router.get("/reports/weekly", asyncHandler(financeReportController.getWeeklyReport));
router.get("/reports/monthly", asyncHandler(financeReportController.getMonthlyReport));
router.get("/reports/yearly", asyncHandler(financeReportController.getYearlyReport));
router.get(
  "/reports/income-vs-expense",
  asyncHandler(financeReportController.getIncomeVsExpense),
);
router.get(
  "/reports/campaigns",
  asyncHandler(financeReportController.getCampaignReport),
);
router.get("/reports/top-donors", asyncHandler(financeReportController.getTopDonors));
router.get(
  "/reports/anonymous",
  asyncHandler(financeReportController.getAnonymousDonations),
);
router.get(
  "/reports/export/:type",
  asyncHandler(financeReportController.exportReport),
);

export default router;
