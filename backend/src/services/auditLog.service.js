import FinancialAuditLog from "../models/FinancialAuditLog.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";

export const logAudit = async ({
  user,
  action,
  entityType,
  entityId,
  metadata = {},
  ip = "",
}) => {
  await FinancialAuditLog.create({
    user: user?._id || null,
    action,
    entityType,
    entityId,
    metadata,
    ip,
  });
};

export const listAuditLogs = async (user, filters = {}) => {
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can view audit logs");
  }

  const query = {};
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.action) query.action = filters.action;
  if (filters.userId) query.user = filters.userId;

  const logs = await FinancialAuditLog.find(query)
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .limit(Number(filters.limit) || 100);

  return logs.map((log) => ({
    id: log._id,
    user: log.user
      ? { id: log.user._id, name: log.user.name, email: log.user.email, role: log.user.role }
      : null,
    ip: log.ip,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));
};
