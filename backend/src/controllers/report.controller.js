import * as reportService from "../services/report.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";

const REPORT_TYPES = ["users", "members", "courses", "enrollments", "attendance", "certificates", "finance", "donations", "expenses", "campaigns", "analytics"];

function authorizeReportAccess(reportType, user) {
  if (user.role === ROLES.SUPER_ADMIN) return;
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.TEACHER && ["courses", "enrollments", "attendance", "certificates"].includes(reportType)) return;
  if (user.role === ROLES.STUDENT && reportType === "enrollments") return;
  if (user.role === ROLES.PARENT && reportType === "enrollments") return;
  throw new ApiError(403, "You do not have permission to access this report");
}

function parseFilters(query) {
  return {
    dateRange: query.dateRange || "",
    startDate: query.startDate || "",
    endDate: query.endDate || "",
    role: query.role || "",
    courseId: query.courseId || "",
    campaignId: query.campaignId || "",
    status: query.status || "",
    gender: query.gender || "",
    category: query.category || "",
    paymentMethod: query.paymentMethod || "",
    completion: query.completion || "",
  };
}

export const getReport = async (req, res) => {
  const { type } = req.params;
  if (!REPORT_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid report type: ${type}`);
  }
  authorizeReportAccess(type, req.user);

  const filters = parseFilters(req.query);
  const result = await reportService.generateReport(type, filters, req.user);
  res.json({ success: true, data: result });
};

export const exportReportCSV = async (req, res) => {
  const { type } = req.query;
  if (!type || !REPORT_TYPES.includes(type)) throw new ApiError(400, "Valid report type required");
  authorizeReportAccess(type, req.user);

  const filters = parseFilters(req.query);
  const result = await reportService.exportReport("csv", type, filters, req.user);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${type}_report.${result.ext}"`);
  res.send(result.data);
};

export const exportReportExcel = async (req, res) => {
  const { type } = req.query;
  if (!type || !REPORT_TYPES.includes(type)) throw new ApiError(400, "Valid report type required");
  authorizeReportAccess(type, req.user);

  const filters = parseFilters(req.query);
  const result = await reportService.exportReport("excel", type, filters, req.user);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${type}_report.${result.ext}"`);
  res.send(Buffer.from(result.data));
};

export const exportReportPDF = async (req, res) => {
  const { type } = req.query;
  if (!type || !REPORT_TYPES.includes(type)) throw new ApiError(400, "Valid report type required");
  authorizeReportAccess(type, req.user);

  const filters = parseFilters(req.query);
  const data = await reportService.generateReport(type, filters, req.user);
  const title = reportService.getReportTitle(type);

  reportService.streamPDF(title, data.columns, data.rows, data.summary, filters, req.user, res);
};
