import Budget from "../models/Budget.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { AUDIT_ACTIONS } from "../constants/finance.js";
import { sanitizeString, parseAmount } from "../utils/financeHelpers.js";
import { logAudit } from "./auditLog.service.js";

export const formatBudget = (budget) => {
  const usagePercent =
    budget.allocatedAmount > 0
      ? Math.round((budget.spentAmount / budget.allocatedAmount) * 100)
      : 0;
  const isWarning = usagePercent >= (budget.warningThreshold || 80);

  return {
    id: budget._id,
    title: budget.title,
    fiscalYear: budget.fiscalYear,
    category: budget.category,
    allocatedAmount: budget.allocatedAmount,
    spentAmount: budget.spentAmount,
    remainingAmount: budget.remainingAmount,
    warningThreshold: budget.warningThreshold,
    usagePercent,
    isWarning,
    createdBy: budget.createdBy,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  };
};

export const createBudget = async (user, data, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to create budgets");
  }

  const budget = await Budget.create({
    title: sanitizeString(data.title),
    fiscalYear: sanitizeString(data.fiscalYear),
    category: sanitizeString(data.category, "General"),
    allocatedAmount: parseAmount(data.allocatedAmount),
    spentAmount: data.spentAmount ? parseAmount(data.spentAmount) : 0,
    warningThreshold: data.warningThreshold ?? 80,
    createdBy: user._id,
  });

  await logAudit({
    user,
    action: AUDIT_ACTIONS.BUDGET_CREATED,
    entityType: "Budget",
    entityId: budget._id,
    ip: reqMeta.ip,
  });

  return formatBudget(budget);
};

export const listBudgets = async (user, filters = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view budgets");
  }

  const query = { isDeleted: { $ne: true } };
  if (filters.fiscalYear) query.fiscalYear = filters.fiscalYear;

  const budgets = await Budget.find(query).sort({ fiscalYear: -1 });
  return budgets.map(formatBudget);
};

export const updateBudget = async (user, budgetId, data, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to update budgets");
  }

  const budget = await Budget.findOne({
    _id: budgetId,
    isDeleted: { $ne: true },
  });
  if (!budget) throw new ApiError(404, "Budget not found");

  const fields = [
    "title",
    "fiscalYear",
    "category",
    "allocatedAmount",
    "spentAmount",
    "warningThreshold",
  ];
  for (const field of fields) {
    if (data[field] !== undefined) {
      budget[field] =
        field === "allocatedAmount" || field === "spentAmount"
          ? parseAmount(data[field])
          : data[field];
    }
  }

  await budget.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.BUDGET_UPDATED,
    entityType: "Budget",
    entityId: budget._id,
    metadata: data,
    ip: reqMeta.ip,
  });

  return formatBudget(budget);
};

export const deleteBudget = async (user, budgetId, reqMeta = {}) => {
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can delete budgets");
  }

  const budget = await Budget.findById(budgetId);
  if (!budget || budget.isDeleted) throw new ApiError(404, "Budget not found");

  budget.isDeleted = true;
  budget.deletedAt = new Date();
  await budget.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.BUDGET_DELETED,
    entityType: "Budget",
    entityId: budget._id,
    ip: reqMeta.ip,
  });

  return { success: true };
};

export const getBudgetWarnings = async (user) => {
  const budgets = await listBudgets(user);
  return budgets.filter((b) => b.isWarning);
};

export const getBudgetSummary = async (user) => {
  const budgets = await listBudgets(user);
  return {
    totalAllocated: budgets.reduce((s, b) => s + b.allocatedAmount, 0),
    totalSpent: budgets.reduce((s, b) => s + b.spentAmount, 0),
    totalRemaining: budgets.reduce((s, b) => s + b.remainingAmount, 0),
    warningCount: budgets.filter((b) => b.isWarning).length,
    budgets,
  };
};
