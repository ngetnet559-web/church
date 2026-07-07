import { api } from "./api.js";

export const reportService = {
  getReport(type, params = {}) {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") query.set(k, v);
    }
    const qs = query.toString();
    return api(`/api/reports/${type}${qs ? `?${qs}` : ""}`);
  },

  exportCSV(type, params = {}) {
    const query = new URLSearchParams();
    query.set("type", type);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") query.set(k, v);
    }
    return api(`/api/reports/export/csv?${query.toString()}`, { responseType: "blob" });
  },

  exportExcel(type, params = {}) {
    const query = new URLSearchParams();
    query.set("type", type);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") query.set(k, v);
    }
    return api(`/api/reports/export/excel?${query.toString()}`, { responseType: "blob" });
  },

  exportPDF(type, params = {}) {
    const query = new URLSearchParams();
    query.set("type", type);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") query.set(k, v);
    }
    return api(`/api/reports/export/pdf?${query.toString()}`, { responseType: "blob" });
  },
};
