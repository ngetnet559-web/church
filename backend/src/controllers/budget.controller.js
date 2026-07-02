import * as budgetService from "../services/budget.service.js";

const reqMeta = (req) => ({ ip: req.ip || req.headers["x-forwarded-for"] || "" });

export const createBudget = async (req, res) => {
  const budget = await budgetService.createBudget(req.user, req.body, reqMeta(req));
  res.status(201).json({ success: true, data: { budget } });
};

export const listBudgets = async (req, res) => {
  const budgets = await budgetService.listBudgets(req.user, req.query);
  res.status(200).json({ success: true, data: { budgets } });
};

export const updateBudget = async (req, res) => {
  const budget = await budgetService.updateBudget(
    req.user,
    req.params.id,
    req.body,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { budget } });
};

export const deleteBudget = async (req, res) => {
  const result = await budgetService.deleteBudget(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: result });
};

export const getBudgetWarnings = async (req, res) => {
  const warnings = await budgetService.getBudgetWarnings(req.user);
  res.status(200).json({ success: true, data: { warnings } });
};

export const getBudgetSummary = async (req, res) => {
  const summary = await budgetService.getBudgetSummary(req.user);
  res.status(200).json({ success: true, data: { summary } });
};
