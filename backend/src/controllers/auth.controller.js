import * as userService from '../services/user.service.js';

const getUserAgent = (req) => req.headers["user-agent"] || "";
const getIP = (req) => req.ip || req.connection?.remoteAddress || "";

export const login = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    const auditLog = await import("../services/audit.service.js");
    const { logActivity } = await import("../services/activity.service.js");
    await auditLog.logLogin({
      user: result.user, ipAddress: getIP(req), userAgent: getUserAgent(req), success: true,
    });
    await logActivity({
      user: result.user, activityType: "user_login", module: "Authentication",
      description: `${result.user.name} logged in`, ipAddress: getIP(req),
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    const auditLog = await import("../services/audit.service.js");
    await auditLog.logLogin({
      user: null, ipAddress: getIP(req), userAgent: getUserAgent(req),
      success: false, failureReason: err.message,
    });
    throw err;
  }
};

export const getMe = async (req, res) => {
  const user = await userService.getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
};

export const logout = async (req, res) => {
  const auditLog = await import("../services/audit.service.js");
  await auditLog.logLogout(req.user, getIP(req), getUserAgent(req));

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
