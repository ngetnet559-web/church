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

router.post("/budgets", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(budgetController.createBudget));
router.get("/budgets", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(budgetController.listBudgets));
router.get("/budgets/summary", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(budgetController.getBudgetSummary));
router.get("/budgets/warnings", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(budgetController.getBudgetWarnings));
router.put("/budgets/:id", authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), asyncHandler(budgetController.updateBudget));
router.delete(
  "/budgets/:id",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(budgetController.deleteBudget),
);

export default router;
