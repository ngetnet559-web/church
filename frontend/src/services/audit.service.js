import { api } from "./api";

const toQuery = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const getAuditLogs = async (params = {}) => {
  const res = await api(`/api/audit${toQuery(params)}`);
  return res;
};

export const getAuditStatistics = async () => {
  const res = await api("/api/audit/statistics");
  return res;
};

export const getLoginHistory = async (params = {}) => {
  const res = await api(`/api/audit/login-history${toQuery(params)}`);
  return res;
};

export const exportAuditLogs = async (params = {}) => {
  const res = await api(`/api/audit/export${toQuery(params)}`);
  return res;
};
