import Donation from "../models/Donation.js";
import DonationCampaign from "../models/DonationCampaign.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfYear,
  groupByMonth,
  toCsv,
} from "../utils/financeHelpers.js";
import { formatDonation } from "./donation.service.js";
import { formatCampaign } from "./campaign.service.js";

const requireFinanceAccess = (user) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view financial reports");
  }
};

const getPaidDonations = (extraQuery = {}) =>
  Donation.find({
    paymentStatus: "Paid",
    isDeleted: { $ne: true },
    ...extraQuery,
  });

const getApprovedExpenses = (extraQuery = {}) =>
  Expense.find({
    status: "Approved",
    isDeleted: { $ne: true },
    ...extraQuery,
  });

export const getDashboardStats = async (user) => {
  requireFinanceAccess(user);

  const today = new Date();
  const startOfDay = getStartOfDay(today);
  const startOfMonth = getStartOfMonth(today);
  const startOfYear = getStartOfYear(today);

  const [donations, expenses, budgets, campaigns] = await Promise.all([
    getPaidDonations(),
    getApprovedExpenses(),
    Budget.find({ isDeleted: { $ne: true } }),
    DonationCampaign.find({ isDeleted: { $ne: true } }),
  ]);

  const sum = (items, field = "amount") =>
    items.reduce((s, item) => s + item[field], 0);

  const activeCampaigns = campaigns.filter((c) => c.active);
  const recentDonations = await getPaidDonations()
    .sort({ donatedAt: -1 })
    .limit(5)
    .populate("campaignId", "title");
  const largestDonations = await getPaidDonations()
    .sort({ amount: -1 })
    .limit(5);

  const monthlyTrend = groupByMonth(donations, "donatedAt", "amount");
  const expenseTrend = groupByMonth(expenses, "expenseDate", "amount");

  return {
    totalDonations: sum(donations),
    todaysDonations: sum(
      donations.filter((d) => d.donatedAt >= startOfDay),
    ),
    monthlyDonations: sum(
      donations.filter((d) => d.donatedAt >= startOfMonth),
    ),
    yearlyDonations: sum(
      donations.filter((d) => d.donatedAt >= startOfYear),
    ),
    totalExpenses: sum(expenses),
    budgetRemaining: sum(budgets, "remainingAmount"),
    budgetAllocated: sum(budgets, "allocatedAmount"),
    activeCampaigns: activeCampaigns.length,
    campaignProgress: activeCampaigns.length
      ? Math.round(
          activeCampaigns.reduce(
            (s, c) =>
              s + (c.goalAmount > 0 ? (c.currentAmount / c.goalAmount) * 100 : 0),
            0,
          ) / activeCampaigns.length,
        )
      : 0,
    incomeVsExpense: {
      income: sum(donations),
      expense: sum(expenses),
      net: sum(donations) - sum(expenses),
    },
    donationTrend: Object.entries(monthlyTrend).map(([label, value]) => ({
      label,
      value,
    })),
    expenseTrend: Object.entries(expenseTrend).map(([label, value]) => ({
      label,
      value,
    })),
    campaignProgressList: activeCampaigns.map(formatCampaign),
    recentDonations: recentDonations.map(formatDonation),
    largestDonations: largestDonations.map(formatDonation),
  };
};

export const getWeeklyReport = async (user) => {
  requireFinanceAccess(user);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [donations, expenses] = await Promise.all([
    getPaidDonations({ donatedAt: { $gte: weekAgo } }),
    getApprovedExpenses({ expenseDate: { $gte: weekAgo } }),
  ]);

  const income = donations.reduce((s, d) => s + d.amount, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return {
    period: "weekly",
    startDate: weekAgo,
    endDate: new Date(),
    income,
    expenses: expenseTotal,
    net: income - expenseTotal,
    donationCount: donations.length,
    expenseCount: expenses.length,
  };
};

export const getMonthlyReport = async (user, year, month) => {
  requireFinanceAccess(user);

  const now = new Date();
  const y = Number(year) || now.getFullYear();
  const m = Number(month) || now.getMonth() + 1;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);

  const [donations, expenses] = await Promise.all([
    getPaidDonations({ donatedAt: { $gte: start, $lte: end } }),
    getApprovedExpenses({ expenseDate: { $gte: start, $lte: end } }),
  ]);

  const income = donations.reduce((s, d) => s + d.amount, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return {
    period: "monthly",
    year: y,
    month: m,
    income,
    expenses: expenseTotal,
    net: income - expenseTotal,
    donationCount: donations.length,
    expenseCount: expenses.length,
    donations: donations.map(formatDonation),
    expenses: expenses.map((e) => ({
      id: e._id,
      title: e.title,
      category: e.category,
      amount: e.amount,
      expenseDate: e.expenseDate,
    })),
  };
};

export const getYearlyReport = async (user, year) => {
  requireFinanceAccess(user);

  const y = Number(year) || new Date().getFullYear();
  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31, 23, 59, 59);

  const [donations, expenses] = await Promise.all([
    getPaidDonations({ donatedAt: { $gte: start, $lte: end } }),
    getApprovedExpenses({ expenseDate: { $gte: start, $lte: end } }),
  ]);

  const income = donations.reduce((s, d) => s + d.amount, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return {
    period: "yearly",
    year: y,
    income,
    expenses: expenseTotal,
    net: income - expenseTotal,
    monthlyBreakdown: {
      donations: groupByMonth(donations, "donatedAt", "amount"),
      expenses: groupByMonth(expenses, "expenseDate", "amount"),
    },
  };
};

export const getIncomeVsExpenseReport = async (user, filters = {}) => {
  requireFinanceAccess(user);

  const query = {};
  if (filters.startDate || filters.endDate) {
    const dateFilter = {};
    if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.$lte = new Date(filters.endDate);

    const [donations, expenses] = await Promise.all([
      getPaidDonations({ donatedAt: dateFilter }),
      getApprovedExpenses({ expenseDate: dateFilter }),
    ]);

    const income = donations.reduce((s, d) => s + d.amount, 0);
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

    return { income, expenses: expenseTotal, net: income - expenseTotal };
  }

  const stats = await getDashboardStats(user);
  return stats.incomeVsExpense;
};

export const getCampaignReport = async (user) => {
  requireFinanceAccess(user);

  const campaigns = await DonationCampaign.find({ isDeleted: { $ne: true } });
  const report = await Promise.all(
    campaigns.map(async (campaign) => {
      const donations = await getPaidDonations({ campaignId: campaign._id });
      return {
        ...formatCampaign(campaign),
        donationCount: donations.length,
        totalRaised: donations.reduce((s, d) => s + d.amount, 0),
      };
    }),
  );

  return report;
};

export const getTopDonors = async (user, limit = 10) => {
  requireFinanceAccess(user);

  const donations = await getPaidDonations({ anonymous: false });
  const donorMap = {};

  for (const d of donations) {
    const key = d.donorEmail || d.donorName;
    if (!donorMap[key]) {
      donorMap[key] = { name: d.donorName, email: d.donorEmail, total: 0, count: 0 };
    }
    donorMap[key].total += d.amount;
    donorMap[key].count += 1;
  }

  return Object.values(donorMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

export const getAnonymousDonationsReport = async (user) => {
  requireFinanceAccess(user);

  const donations = await getPaidDonations({ anonymous: true });
  return {
    count: donations.length,
    total: donations.reduce((s, d) => s + d.amount, 0),
    donations: donations.map(formatDonation),
  };
};

export const exportReport = async (user, reportType, format = "csv", filters = {}) => {
  requireFinanceAccess(user);

  let data;
  let columns;

  switch (reportType) {
    case "donations": {
      const donations = await getPaidDonations();
      data = donations.map(formatDonation);
      columns = [
        { key: "donorName", label: "Donor" },
        { key: "amount", label: "Amount" },
        { key: "currency", label: "Currency" },
        { key: "paymentMethod", label: "Method" },
        { key: "donationType", label: "Type" },
        { key: "donatedAt", label: "Date" },
      ];
      break;
    }
    case "expenses": {
      const expenses = await getApprovedExpenses();
      data = expenses.map((e) => ({
        title: e.title,
        category: e.category,
        amount: e.amount,
        expenseDate: e.expenseDate,
      }));
      columns = [
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "amount", label: "Amount" },
        { key: "expenseDate", label: "Date" },
      ];
      break;
    }
    case "monthly": {
      const report = await getMonthlyReport(user, filters.year, filters.month);
      return exportReport(user, "donations", format, filters);
    }
    default:
      throw new ApiError(400, "Invalid report type");
  }

  if (format === "csv" || format === "excel") {
    return {
      contentType: format === "excel" ? "application/vnd.ms-excel" : "text/csv",
      filename: `${reportType}-${Date.now()}.${format === "excel" ? "xls" : "csv"}`,
      data: toCsv(data, columns),
    };
  }

  if (format === "pdf") {
    return {
      contentType: "text/html",
      filename: `${reportType}-${Date.now()}.html`,
      data: `<html><body><h1>${reportType} Report</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`,
    };
  }

  return { data, columns };
};
