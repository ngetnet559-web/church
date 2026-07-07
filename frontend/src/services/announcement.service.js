import { api } from "./api.js";

export const announcementService = {
  getAnnouncements(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.isActive !== undefined) query.set("isActive", params.isActive);
    if (params.search) query.set("search", params.search);
    if (params.isPinned !== undefined) query.set("isPinned", params.isPinned);
    const qs = query.toString();
    return api(`/api/announcements${qs ? `?${qs}` : ""}`);
  },

  getActiveAnnouncements() {
    return api("/api/announcements/active");
  },

  getAnnouncementById(id) {
    return api(`/api/announcements/${id}`);
  },

  createAnnouncement(data) {
    return api("/api/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAnnouncement(id, data) {
    return api(`/api/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteAnnouncement(id) {
    return api(`/api/announcements/${id}`, { method: "DELETE" });
  },
};
