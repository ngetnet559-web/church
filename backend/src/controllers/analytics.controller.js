import * as analyticsService from "../services/analytics.service.js";

export const dashboardSummary = async (req, res) => {
  const data =
    await analyticsService.getDashboardSummary();

  res.json({
    success: true,
    data,
  });
};

export const userAnalytics = async (req, res) => {
  const data =
    await analyticsService.getUserAnalytics();

  res.json({
    success: true,
    data,
  });
};

export const courseAnalytics = async (req, res) => {
  const data =
    await analyticsService.getCourseAnalytics();

  res.json({
    success: true,
    data,
  });
};

export const attendanceAnalytics = async (req, res) => {
  const data =
    await analyticsService.getAttendanceAnalytics();

  res.json({
    success: true,
    data,
  });
};

export const certificateAnalytics = async (req, res) => {
  const data =
    await analyticsService.getCertificateAnalytics();

  res.json({
    success: true,
    data,
  });
};

export const financeAnalytics = async (req, res) => {
  const data =
    await analyticsService.getFinanceAnalytics();

  res.json({
    success: true,
    data,
  });
};

export const memberAnalytics = async (req, res) => {
  const data =
    await analyticsService.getMemberAnalytics();

  res.json({
    success: true,
    data,
  });
};

export const charts = async (req, res) => {
  const period =
    req.query.period || "all";

  const data =
    await analyticsService.getCharts(period);

  res.json({
    success: true,
    data,
  });
};

export const dashboard = async (req, res) => {
  const period = req.query.period || "all";
  const data = await analyticsService.getDashboardKPIs(period);
  res.json({ success: true, data });
};

export const enrollmentTrend = async (req, res) => {
  const period = req.query.period || "all";
  const data = await analyticsService.getEnrollmentTrend(period);
  res.json({ success: true, data });
};

export const completionRate = async (req, res) => {
  const data = await analyticsService.getCourseCompletionRate();
  res.json({ success: true, data });
};

export const attendanceRate = async (req, res) => {
  const period = req.query.period || "all";
  const data = await analyticsService.getAttendanceRate(period);
  res.json({ success: true, data });
};

export const donationTrend = async (req, res) => {
  const groupBy = req.query.groupBy || "month";
  const data = await analyticsService.getDonationTrend(groupBy);
  res.json({ success: true, data });
};

export const expenseTrend = async (req, res) => {
  const groupBy = req.query.groupBy || "month";
  const data = await analyticsService.getExpenseTrend(groupBy);
  res.json({ success: true, data });
};

export const netIncome = async (req, res) => {
  const period = req.query.period || "all";
  const data = await analyticsService.getNetIncomeTrend(period);
  res.json({ success: true, data });
};

export const topDonors = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await analyticsService.getTopDonors(limit);
  res.json({ success: true, data });
};

export const topStudents = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await analyticsService.getMostActiveStudents(limit);
  res.json({ success: true, data });
};

export const teacherPerformance = async (req, res) => {
  const data = await analyticsService.getTeacherPerformance();
  res.json({ success: true, data });
};

export const certificateTrend = async (req, res) => {
  const period = req.query.period || "all";
  const data = await analyticsService.getCertificatesIssuedByMonth(period);
  res.json({ success: true, data });
};

export const memberGrowth = async (req, res) => {
  const period = req.query.period || "all";
  const data = await analyticsService.getMemberGrowth(period);
  res.json({ success: true, data });
};

export const activeUsers = async (req, res) => {
  const data = await analyticsService.getActiveUsers();
  res.json({ success: true, data });
};