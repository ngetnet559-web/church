import { api } from "./api.js";

export const analyticsService = {
  getSummary() {
    return api("/api/analytics/summary");
  },

  getUsers() {
    return api("/api/analytics/users");
  },

  getCourses() {
    return api("/api/analytics/courses");
  },

  getAttendance() {
    return api("/api/analytics/attendance");
  },

  getCertificates() {
    return api("/api/analytics/certificates");
  },

  getFinance() {
    return api("/api/analytics/finance");
  },

  getMembers() {
    return api("/api/analytics/members");
  },

  getCharts(period = "all") {
    return api(`/api/analytics/charts?period=${period}`);
  },

  getDashboard(period = "all") {
    return api(`/api/analytics/dashboard?period=${period}`);
  },

  getEnrollmentTrend(period = "all") {
    return api(`/api/analytics/enrollment-trend?period=${period}`);
  },

  getCompletionRate() {
    return api("/api/analytics/completion-rate");
  },

  getAttendanceRate(period = "all") {
    return api(`/api/analytics/attendance-rate?period=${period}`);
  },

  getDonationTrend(groupBy = "month") {
    return api(`/api/analytics/donation-trend?groupBy=${groupBy}`);
  },

  getExpenseTrend(groupBy = "month") {
    return api(`/api/analytics/expense-trend?groupBy=${groupBy}`);
  },

  getNetIncome(period = "all") {
    return api(`/api/analytics/net-income?period=${period}`);
  },

  getTopDonors(limit = 10) {
    return api(`/api/analytics/top-donors?limit=${limit}`);
  },

  getTopStudents(limit = 10) {
    return api(`/api/analytics/top-students?limit=${limit}`);
  },

  getTeacherPerformance() {
    return api("/api/analytics/teacher-performance");
  },

  getCertificateTrend(period = "all") {
    return api(`/api/analytics/certificate-trend?period=${period}`);
  },

  getMemberGrowth(period = "all") {
    return api(`/api/analytics/member-growth?period=${period}`);
  },

  getActiveUsers() {
    return api("/api/analytics/active-users");
  },
};