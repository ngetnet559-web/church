import * as financeReportService from "../services/financeReport.service.js";

export const getDashboard = async (req, res) => {
  const stats = await financeReportService.getDashboardStats(req.user);
  res.status(200).json({ success: true, data: { stats } });
};

export const getWeeklyReport = async (req, res) => {
  const report = await financeReportService.getWeeklyReport(req.user);
  res.status(200).json({ success: true, data: { report } });
};

export const getMonthlyReport = async (req, res) => {
  const report = await financeReportService.getMonthlyReport(
    req.user,
    req.query.year,
    req.query.month,
  );
  res.status(200).json({ success: true, data: { report } });
};

export const getYearlyReport = async (req, res) => {
  const report = await financeReportService.getYearlyReport(
    req.user,
    req.query.year,
  );
  res.status(200).json({ success: true, data: { report } });
};

export const getIncomeVsExpense = async (req, res) => {
  const report = await financeReportService.getIncomeVsExpenseReport(
    req.user,
    req.query,
  );
  res.status(200).json({ success: true, data: { report } });
};

export const getCampaignReport = async (req, res) => {
  const report = await financeReportService.getCampaignReport(req.user);
  res.status(200).json({ success: true, data: { report } });
};

export const getTopDonors = async (req, res) => {
  const donors = await financeReportService.getTopDonors(
    req.user,
    Number(req.query.limit) || 10,
  );
  res.status(200).json({ success: true, data: { donors } });
};

export const getAnonymousDonations = async (req, res) => {
  const report = await financeReportService.getAnonymousDonationsReport(req.user);
  res.status(200).json({ success: true, data: { report } });
};

export const exportReport = async (req, res) => {
  const exported = await financeReportService.exportReport(
    req.user,
    req.params.type,
    req.query.format || "csv",
    req.query,
  );

  if (exported.contentType) {
    res.setHeader("Content-Type", exported.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${exported.filename}"`);
    return res.send(exported.data);
  }

  res.status(200).json({ success: true, data: exported });
};
