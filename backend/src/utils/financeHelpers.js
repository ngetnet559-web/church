import { ApiError } from "./ApiError.js";

export const sanitizeString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

export const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, "Invalid amount");
  }
  return amount;
};

export const buildDateRangeQuery = (startDate, endDate, field = "donatedAt") => {
  if (!startDate && !endDate) return {};
  const range = {};
  if (startDate) range.$gte = new Date(startDate);
  if (endDate) range.$lte = new Date(endDate);
  return { [field]: range };
};

export const getStartOfDay = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getStartOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const getStartOfYear = (date = new Date()) =>
  new Date(date.getFullYear(), 0, 1);

export const calculateProgress = (current, goal) =>
  goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

export const groupByMonth = (items, dateField, amountField) => {
  const groups = {};
  for (const item of items) {
    const date = new Date(item[dateField]);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    groups[key] = (groups[key] || 0) + (item[amountField] || 0);
  }
  return groups;
};

export const toCsv = (rows, columns) => {
  const header = columns.map((col) => col.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const value = row[col.key] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
};

export const requireUniqueReference = async (Model, reference, excludeId = null) => {
  if (!reference) return;
  const query = { transactionReference: reference, isDeleted: { $ne: true } };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Model.findOne(query);
  if (existing) {
    throw new ApiError(409, "Transaction reference already exists");
  }
};
