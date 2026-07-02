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
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.post("/expenses", asyncHandler(expenseController.createExpense));
router.get("/expenses", asyncHandler(expenseController.listExpenses));
router.get("/expenses/report", asyncHandler(expenseController.getExpenseReport));
router.get("/expenses/export", asyncHandler(expenseController.exportExpenseReport));
router.get("/expenses/:id", asyncHandler(expenseController.getExpenseById));
router.post(
  "/expenses/:id/approve",
  asyncHandler(expenseController.approveExpense),
);
router.delete(
  "/expenses/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(expenseController.deleteExpense),
);

export default router;
