import { Router } from "express";
import * as budgetController from "../controllers/budget.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(requireDatabase);
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.post("/budgets", asyncHandler(budgetController.createBudget));
router.get("/budgets", asyncHandler(budgetController.listBudgets));
router.get("/budgets/summary", asyncHandler(budgetController.getBudgetSummary));
router.get("/budgets/warnings", asyncHandler(budgetController.getBudgetWarnings));
router.put("/budgets/:id", asyncHandler(budgetController.updateBudget));
router.delete(
  "/budgets/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(budgetController.deleteBudget),
);

export default router;
