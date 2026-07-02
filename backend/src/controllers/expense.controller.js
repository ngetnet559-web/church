import * as expenseService from "../services/expense.service.js";

const reqMeta = (req) => ({ ip: req.ip || req.headers["x-forwarded-for"] || "" });

export const createExpense = async (req, res) => {
  const expense = await expenseService.createExpense(req.user, req.body, reqMeta(req));
  res.status(201).json({ success: true, data: { expense } });
};

export const listExpenses = async (req, res) => {
  const expenses = await expenseService.listExpenses(req.user, req.query);
  res.status(200).json({ success: true, data: { expenses } });
};

export const getExpenseById = async (req, res) => {
  const expense = await expenseService.getExpenseById(req.user, req.params.id);
  res.status(200).json({ success: true, data: { expense } });
};

export const approveExpense = async (req, res) => {
  const expense = await expenseService.approveExpense(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { expense } });
};

export const deleteExpense = async (req, res) => {
  const result = await expenseService.deleteExpense(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: result });
};

export const getExpenseReport = async (req, res) => {
  const report = await expenseService.getExpenseReport(req.user, req.query);
  res.status(200).json({ success: true, data: { report } });
};

export const exportExpenseReport = async (req, res) => {
  const exported = await expenseService.exportExpenseReport(
    req.user,
    req.query,
    req.query.format || "csv",
  );
  res.setHeader("Content-Type", exported.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${exported.filename}"`);
  res.send(exported.data);
};
