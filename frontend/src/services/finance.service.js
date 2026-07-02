import { api } from "./api.js";

const BASE = "/api";

export const financeApi = {
  getDashboard: () => api(`${BASE}/finance/reports/dashboard`),
  getWeeklyReport: () => api(`${BASE}/finance/reports/weekly`),
  getMonthlyReport: (year, month) =>
    api(`${BASE}/finance/reports/monthly?year=${year || ""}&month=${month || ""}`),
  getYearlyReport: (year) =>
    api(`${BASE}/finance/reports/yearly?year=${year || ""}`),
  getIncomeVsExpense: (params = "") =>
    api(`${BASE}/finance/reports/income-vs-expense${params ? `?${params}` : ""}`),
  getTopDonors: (limit = 10) =>
    api(`${BASE}/finance/reports/top-donors?limit=${limit}`),
  exportReport: (type, format = "csv") =>
    api(`${BASE}/finance/reports/export/${type}?format=${format}`),

  listDonations: (query = "") =>
    api(`${BASE}/donations${query ? `?${query}` : ""}`),
  getDonation: (id) => api(`${BASE}/donations/${id}`),
  createDonation: (data) =>
    api(`${BASE}/donations`, { method: "POST", body: JSON.stringify(data) }),
  updateDonation: (id, data) =>
    api(`${BASE}/donations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  refundDonation: (id) =>
    api(`${BASE}/donations/${id}/refund`, { method: "POST" }),
  approveDonation: (id) =>
    api(`${BASE}/donations/${id}/approve`, { method: "POST" }),
  getReceipt: (id) => api(`${BASE}/donations/${id}/receipt`),
  getMyDonations: () => api(`${BASE}/my-donations`),
  getMyStatistics: () => api(`${BASE}/my-donations/statistics`),

  listCampaigns: (query = "") =>
    api(`${BASE}/campaigns${query ? `?${query}` : ""}`),
  getCampaign: (id) => api(`${BASE}/campaigns/${id}`),
  getCampaignProgress: (id) => api(`${BASE}/campaigns/${id}/progress`),
  getCampaignAnalytics: (id) => api(`${BASE}/campaigns/${id}/analytics`),
  createCampaign: (data) =>
    api(`${BASE}/campaigns`, { method: "POST", body: JSON.stringify(data) }),
  updateCampaign: (id, data) =>
    api(`${BASE}/campaigns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  closeCampaign: (id) =>
    api(`${BASE}/campaigns/${id}/close`, { method: "POST" }),

  listExpenses: (query = "") =>
    api(`${BASE}/expenses${query ? `?${query}` : ""}`),
  getExpense: (id) => api(`${BASE}/expenses/${id}`),
  createExpense: (data) =>
    api(`${BASE}/expenses`, { method: "POST", body: JSON.stringify(data) }),
  approveExpense: (id) =>
    api(`${BASE}/expenses/${id}/approve`, { method: "POST" }),

  listBudgets: () => api(`${BASE}/budgets`),
  getBudgetSummary: () => api(`${BASE}/budgets/summary`),
  getBudgetWarnings: () => api(`${BASE}/budgets/warnings`),
  createBudget: (data) =>
    api(`${BASE}/budgets`, { method: "POST", body: JSON.stringify(data) }),
  updateBudget: (id, data) =>
    api(`${BASE}/budgets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};
