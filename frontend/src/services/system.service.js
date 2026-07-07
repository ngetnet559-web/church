import api from "./api";

export const systemService = {
  getAuditLogs: (params = {}) => api.get("/audit", { params }),
  getAuditStatistics: () => api.get("/audit/statistics"),
  getLoginHistory: (params = {}) => api.get("/audit/login-history", { params }),
  exportAuditLogs: (params = {}) => api.get("/audit/export", { params, responseType: "blob" }),
  getActivities: (params = {}) => api.get("/activity", { params }),
  getRecentActivities: (params = {}) => api.get("/activity/recent", { params }),
  getActivityTimeline: (params = {}) => api.get("/activity/timeline", { params }),
  getActivityStats: (params = {}) => api.get("/activity/stats", { params }),
};

export default systemService;
