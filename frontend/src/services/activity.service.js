import { api } from "./api";

const toQuery = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const getActivities = async (params = {}) => {
  const res = await api(`/api/activity${toQuery(params)}`);
  return res;
};

export const getRecentActivities = async () => {
  const res = await api("/api/activity/recent");
  return res;
};

export const getActivityTimeline = async () => {
  const res = await api("/api/activity/timeline");
  return res;
};

export const getActivityStats = async () => {
  const res = await api("/api/activity/stats");
  return res;
};
