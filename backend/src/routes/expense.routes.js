import { Router } from "express";
import * as expenseController from "../controllers/expense.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(requireDatabase);
router.use(authenticate);

router.post("/expenses", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(expenseController.createExpense));
router.get("/expenses", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(expenseController.listExpenses));
router.get("/expenses/report", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(expenseController.getExpenseReport));
router.get("/expenses/export", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(expenseController.exportExpenseReport));
router.get("/expenses/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(expenseController.getExpenseById));
router.post(
  "/expenses/:id/approve",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  asyncHandler(expenseController.approveExpense),
);
router.delete(
  "/expenses/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(expenseController.deleteExpense),
);

export default router;
