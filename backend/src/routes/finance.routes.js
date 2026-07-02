import { Router } from "express";
import donationRoutes from "./donation.routes.js";
import campaignRoutes from "./campaign.routes.js";
import expenseRoutes from "./expense.routes.js";
import budgetRoutes from "./budget.routes.js";

const router = Router();

router.use(donationRoutes);
router.use(campaignRoutes);
router.use(expenseRoutes);
router.use(budgetRoutes);

export default router;
