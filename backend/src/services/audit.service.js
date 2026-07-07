import AuditLog from "../models/AuditLog.js";
import LoginHistory from "../models/LoginHistory.js";
import { AUDIT_MODULES, AUDIT_ACTIONS } from "../constants/audit.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";

function parseUA(ua = "") {
  const lower = ua.toLowerCase();
  return {
    browser: lower.includes("chrome") ? "Chrome" : lower.includes("firefox") ? "Firefox" : lower.includes("safari") ? "Safari" : lower.includes("edge") ? "Edge" : "Unknown",
    os: lower.includes("windows") ? "Windows" : lower.includes("mac") ? "macOS" : lower.includes("linux") ? "Linux" : lower.includes("android") ? "Android" : lower.includes("ios") ? "iOS" : "Unknown",
    device: lower.includes("mobile") ? "Mobile" : lower.includes("tablet") ? "Tablet" : "Desktop",
  };
}

export async function logAudit({
  user = null,
  role = "",
  action,
  module,
  targetCollection = "",
  targetId = null,
  description = "",
  oldValues = {},
  newValues = {},
  ipAddress = "",
  userAgent = "",
  success = true,
  statusCode = 200,
  metadata = {},
} = {}) {
  const ua = parseUA(userAgent);

  try {
    await AuditLog.create({
      user: user?._id || user || null,
      role: role || user?.role || "",
      action,
      module,
      targetCollection,
      targetId,
      description,
      oldValues: maskSensitive(oldValues),
      newValues: maskSensitive(newValues),
      ipAddress,
      browser: ua.browser,
      operatingSystem: ua.os,
      device: ua.device,
      success,
      statusCode,
      metadata,
    });
  } catch {
    // non-blocking
  }
}

function maskSensitive(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const masked = { ...obj };
  const sensitive = ["password", "token", "secret", "jwt", "authorization", "cookie"];
  for (const key of Object.keys(masked)) {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      masked[key] = "***MASKED***";
    }
  }
  return masked;
}

export async function logLogin({
  user,
  ipAddress = "",
  userAgent = "",
  success = true,
  failureReason = "",
}) {
  const ua = parseUA(userAgent);

  try {
    const record = await LoginHistory.create({
      user: user?._id || user,
      loginTime: new Date(),
      ipAddress,
      browser: ua.browser,
      operatingSystem: ua.os,
      device: ua.device,
      success,
      failureReason,
    });

    await logAudit({
      user,
      action: success ? AUDIT_ACTIONS.LOGIN : AUDIT_ACTIONS.LOGIN,
      module: AUDIT_MODULES.AUTH,
      description: success ? "User logged in" : `Failed login attempt: ${failureReason}`,
      ipAddress,
      userAgent,
      success,
      statusCode: success ? 200 : 401,
      metadata: { failureReason },
    });

    return record;
  } catch {
    // non-blocking
  }
}

export async function logLogout(user, ipAddress = "", userAgent = "") {
  try {
    const lastLogin = await LoginHistory.findOne({
      user: user._id || user,
      logoutTime: null,
    }).sort({ loginTime: -1 });

    if (lastLogin) {
      const duration = Math.floor((Date.now() - new Date(lastLogin.loginTime).getTime()) / 1000);
      lastLogin.logoutTime = new Date();
      lastLogin.sessionDuration = duration;
      await lastLogin.save();
    }

    await logAudit({
      user,
      action: AUDIT_ACTIONS.LOGOUT,
      module: AUDIT_MODULES.AUTH,
      description: "User logged out",
      ipAddress,
      userAgent,
    });
  } catch {
    // non-blocking
  }
}

export async function getAuditLogs({
  page = 1,
  limit = 50,
  userId,
  role,
  action,
  module,
  success,
  search,
  startDate,
  endDate,
  ipAddress,
  sortBy = "createdAt",
  sortOrder = -1,
} = {}) {
  const query = {};

  if (userId) query.user = userId;
  if (role) query.role = role;
  if (action) query.action = action;
  if (module) query.module = module;
  if (success !== undefined && success !== "") query.success = success === "true" || success === true;
  if (ipAddress) query.ipAddress = { $regex: ipAddress, $options: "i" };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { targetCollection: { $regex: search, $options: "i" } },
      { module: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("user", "name email role")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs: logs.map((l) => ({
      id: l._id,
      user: l.user ? { id: l.user._id, name: l.user.name, email: l.user.email, role: l.user.role } : null,
      role: l.role,
      action: l.action,
      module: l.module,
      targetCollection: l.targetCollection,
      targetId: l.targetId,
      description: l.description,
      ipAddress: l.ipAddress,
      browser: l.browser,
      operatingSystem: l.operatingSystem,
      device: l.device,
      country: l.country,
      city: l.city,
      success: l.success,
      statusCode: l.statusCode,
      createdAt: l.createdAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAuditStatistics({ startDate, endDate } = {}) {
  const dateMatch = {};
  if (startDate || endDate) {
    dateMatch.createdAt = {};
    if (startDate) dateMatch.createdAt.$gte = new Date(startDate);
    if (endDate) dateMatch.createdAt.$lte = new Date(endDate);
  }

  const [totalLogs, totalSuccess, totalFailed, moduleStats, actionStats, recentLogs] = await Promise.all([
    AuditLog.countDocuments(dateMatch),
    AuditLog.countDocuments({ ...dateMatch, success: true }),
    AuditLog.countDocuments({ ...dateMatch, success: false }),
    AuditLog.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$module", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.find(dateMatch).populate("user", "name email").sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    totalLogs,
    totalSuccess,
    totalFailed,
    successRate: totalLogs > 0 ? Math.round((totalSuccess / totalLogs) * 100) : 0,
    moduleStats,
    actionStats,
    recentLogs: recentLogs.map((l) => ({
      id: l._id,
      user: l.user ? { name: l.user.name, email: l.user.email } : null,
      action: l.action,
      module: l.module,
      description: l.description,
      success: l.success,
      createdAt: l.createdAt,
    })),
  };
}

export async function getLoginHistory({
  page = 1,
  limit = 50,
  userId,
  success,
  startDate,
  endDate,
} = {}) {
  const query = {};
  if (userId) query.user = userId;
  if (success !== undefined && success !== "") query.success = success === "true" || success === true;
  if (startDate || endDate) {
    query.loginTime = {};
    if (startDate) query.loginTime.$gte = new Date(startDate);
    if (endDate) query.loginTime.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    LoginHistory.find(query)
      .populate("user", "name email role")
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LoginHistory.countDocuments(query),
  ]);

  return {
    records: records.map((r) => ({
      id: r._id,
      user: r.user ? { id: r.user._id, name: r.user.name, email: r.user.email, role: r.user.role } : null,
      loginTime: r.loginTime,
      logoutTime: r.logoutTime,
      ipAddress: r.ipAddress,
      browser: r.browser,
      operatingSystem: r.operatingSystem,
      device: r.device,
      country: r.country,
      city: r.city,
      success: r.success,
      failureReason: r.failureReason,
      sessionDuration: r.sessionDuration,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function exportAuditLogs(format, filters) {
  const result = await getAuditLogs({ ...filters, limit: 10000 });
  const rows = result.logs;

  const columns = [
    { key: "user.name", label: "User" }, { key: "role", label: "Role" },
    { key: "action", label: "Action" }, { key: "module", label: "Module" },
    { key: "targetCollection", label: "Target" }, { key: "description", label: "Description" },
    { key: "ipAddress", label: "IP" }, { key: "browser", label: "Browser" },
    { key: "operatingSystem", label: "OS" }, { key: "device", label: "Device" },
    { key: "success", label: "Success" }, { key: "createdAt", label: "Date" },
  ];

  function getVal(row, keyPath) {
    const keys = keyPath.split(".");
    let val = row;
    for (const k of keys) val = val?.[k];
    return val;
  }

  if (format === "csv") {
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const body = rows.map((r) =>
      columns.map((c) => {
        const val = getVal(r, c.key);
        if (val === null || val === undefined) return "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );
    return { data: [header, ...body].join("\n"), contentType: "text/csv", ext: "csv" };
  }

  if (format === "excel") {
    try {
      const ExcelJS = (await import("exceljs"));
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Audit Logs");

      sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: 20 }));

      rows.forEach((r) => {
        const rowData = {};
        columns.forEach((c) => { rowData[c.key] = getVal(r, c.key); });
        sheet.addRow(rowData);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return { data: buffer, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx" };
    } catch {
      return exportAuditLogs("csv", filters);
    }
  }

  if (format === "pdf") {
    try {
      const PDFDocument = (await import("pdfkit")).default;
      const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));

      doc.fontSize(16).text("Audit Logs", { align: "center" });
      doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: "center" });
      doc.moveDown();

      const header = columns.map((c) => c.label);
      const colWidths = columns.map(() => 80);
      const startX = 30;
      let startY = doc.y;

      doc.fontSize(8).font("Helvetica-Bold");
      header.forEach((h, i) => doc.text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, { width: colWidths[i], align: "left" }));
      startY += 15;

      doc.font("Helvetica");
      rows.forEach((r) => {
        if (startY > 550) { doc.addPage(); startY = 30; }
        columns.forEach((c, i) => {
          const val = getVal(r, c.key);
          doc.text(val ?? "", startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, { width: colWidths[i], align: "left" });
        });
        startY += 15;
      });

      doc.end();

      await new Promise((resolve) => doc.on("end", resolve));
      return { data: Buffer.concat(buffers), contentType: "application/pdf", ext: "pdf" };
    } catch {
      return exportAuditLogs("csv", filters);
    }
  }

  throw new Error(`Unsupported export format: ${format}`);
}

export function canAccessAudit(user) {
  if (user.role === ROLES.SUPER_ADMIN) return "full";
  if (user.role === ROLES.ADMIN) return "read";
  return "own";
}

export function buildAuditFilter(user) {
  const access = canAccessAudit(user);
  if (access === "full" || access === "read") return {};
  return { userId: user._id };
}
