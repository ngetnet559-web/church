import Expense from "../models/Expense.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { EXPENSE_CATEGORIES } from "../constants/finance.js";
import { AUDIT_ACTIONS } from "../constants/finance.js";
import {
  sanitizeString,
  parseAmount,
  buildDateRangeQuery,
  toCsv,
} from "../utils/financeHelpers.js";
import { logAudit } from "./auditLog.service.js";
import { syncBudgetFromExpense } from "./donation.service.js";

export const formatExpense = (expense) => ({
  id: expense._id,
  title: expense.title,
  description: expense.description,
  category: expense.category,
  amount: expense.amount,
  paymentMethod: expense.paymentMethod,
  receiptImage: expense.receiptImage,
  expenseDate: expense.expenseDate,
  status: expense.status,
  approvedBy: expense.approvedBy,
  createdBy: expense.createdBy,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
});

export const createExpense = async (user, data, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to create expenses");
  }

  if (data.category && !EXPENSE_CATEGORIES.includes(data.category)) {
    throw new ApiError(400, "Invalid expense category");
  }

  const expense = await Expense.create({
    title: sanitizeString(data.title),
    description: sanitizeString(data.description),
    category: data.category || "Other",
    amount: parseAmount(data.amount),
    paymentMethod: data.paymentMethod || "Cash",
    receiptImage: sanitizeString(data.receiptImage),
    expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
    createdBy: user._id,
  });

  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Create", module: "Expense", targetCollection: "Expense", targetId: expense._id, description: `Expense "${expense.title}" of ${expense.amount} created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "expense_created", module: "Expense", description: `Expense "${expense.title}" created`, targetId: expense._id, targetModel: "Expense" })).catch(() => {});

  await logAudit({
    user,
    action: AUDIT_ACTIONS.EXPENSE_CREATED,
    entityType: "Expense",
    entityId: expense._id,
    ip: reqMeta.ip,
  });

  return formatExpense(expense);
};

export const listExpenses = async (user, filters = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view expenses");
  }

  const query = { isDeleted: { $ne: true } };
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  Object.assign(query, buildDateRangeQuery(filters.startDate, filters.endDate, "expenseDate"));

  const expenses = await Expense.find(query)
    .populate("approvedBy", "name email")
    .populate("createdBy", "name email")
    .sort({ expenseDate: -1 });

  return expenses.map(formatExpense);
};

export const getExpenseById = async (user, expenseId) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view expenses");
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    isDeleted: { $ne: true },
  });
  if (!expense) throw new ApiError(404, "Expense not found");
  return formatExpense(expense);
};

export const approveExpense = async (user, expenseId, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to approve expenses");
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    isDeleted: { $ne: true },
  });
  if (!expense) throw new ApiError(404, "Expense not found");
  if (expense.status === "Approved") return formatExpense(expense);

  expense.status = "Approved";
  expense.approvedBy = user._id;
  await expense.save();
  await syncBudgetFromExpense(expense.category, expense.amount);

  import("../services/autoNotification.service.js").then(m => m.notifyExpenseApproved(expense)).catch(() => {});
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Approve", module: "Expense", targetCollection: "Expense", targetId: expense._id, description: `Expense "${expense.title}" approved` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "expense_approved", module: "Expense", description: `Expense "${expense.title}" approved`, targetId: expense._id, targetModel: "Expense" })).catch(() => {});

  await logAudit({
    user,
    action: AUDIT_ACTIONS.EXPENSE_APPROVED,
    entityType: "Expense",
    entityId: expense._id,
    ip: reqMeta.ip,
  });

  return formatExpense(expense);
};

export const deleteExpense = async (user, expenseId, reqMeta = {}) => {
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can delete expenses");
  }

  const expense = await Expense.findById(expenseId);
  if (!expense || expense.isDeleted) throw new ApiError(404, "Expense not found");

  expense.isDeleted = true;
  expense.deletedAt = new Date();
  await expense.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.EXPENSE_DELETED,
    entityType: "Expense",
    entityId: expense._id,
    ip: reqMeta.ip,
  });

  return { success: true };
};

export const getExpenseReport = async (user, filters = {}) => {
  const expenses = await listExpenses(user, { ...filters, status: "Approved" });
  const byCategory = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  return {
    total: expenses.reduce((s, e) => s + e.amount, 0),
    count: expenses.length,
    byCategory,
    expenses,
  };
};

export const exportExpenseReport = async (user, filters = {}, format = "csv") => {
  const report = await getExpenseReport(user, filters);
  const columns = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "expenseDate", label: "Date" },
    { key: "status", label: "Status" },
  ];

  if (format === "csv" || format === "excel") {
    return {
      contentType: format === "excel" ? "application/vnd.ms-excel" : "text/csv",
      filename: `expenses-${Date.now()}.${format === "excel" ? "xls" : "csv"}`,
      data: toCsv(report.expenses, columns),
    };
  }

  return report;
};
