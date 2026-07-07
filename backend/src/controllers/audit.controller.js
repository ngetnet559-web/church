import * as auditService from "../services/audit.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";

export const getAuditLogs = async (req, res) => {
  const filters = buildFilters(req);
  const access = auditService.canAccessAudit(req.user);

  if (access === "own") {
    filters.userId = req.user._id;
  }

  const result = await auditService.getAuditLogs(filters);
  res.json({ success: true, data: result });
};

export const getAuditStatistics = async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await auditService.getAuditStatistics({ startDate, endDate });
  res.json({ success: true, data: stats });
};

export const getLoginHistory = async (req, res) => {
  const access = auditService.canAccessAudit(req.user);
  const filters = { ...buildFilters(req) };

  if (access === "own") {
    filters.userId = req.user._id;
  }

  const result = await auditService.getLoginHistory(filters);
  res.json({ success: true, data: result });
};

export const exportAuditLogs = async (req, res) => {
  const { format = "csv" } = req.query;
  if (!["csv", "excel", "pdf"].includes(format)) {
    throw new ApiError(400, "Unsupported export format");
  }

  if (req.user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can export audit logs");
  }

  const filters = buildFilters(req);
  const result = await auditService.exportAuditLogs(format, filters);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="audit_logs.${result.ext}"`);
  res.send(result.data);
};

function buildFilters(req) {
  const {
    page, limit, userId, role, action, module, success,
    search, startDate, endDate, ipAddress, sortBy, sortOrder,
  } = req.query;

  return {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
    userId, role, action, module, success, search,
    startDate, endDate, ipAddress, sortBy, sortOrder: sortOrder ? parseInt(sortOrder) : -1,
  };
}
