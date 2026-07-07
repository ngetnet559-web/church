import { api } from "./api.js";

export const notificationService = {
  getNotifications(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.isRead !== undefined) query.set("isRead", params.isRead);
    if (params.category) query.set("category", params.category);
    if (params.priority) query.set("priority", params.priority);
    if (params.type) query.set("type", params.type);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return api(`/api/notifications${qs ? `?${qs}` : ""}`);
  },

  getUnreadNotifications(limit = 10) {
    return api(`/api/notifications/unread?limit=${limit}`);
  },

  getUnreadCount() {
    return api("/api/notifications/count");
  },

  markAsRead(id) {
    return api(`/api/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllAsRead() {
    return api("/api/notifications/read-all", { method: "PATCH" });
  },

  deleteNotification(id) {
    return api(`/api/notifications/${id}`, { method: "DELETE" });
  },

  createNotification(data) {
    return api("/api/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createBulkNotification(data) {
    return api("/api/notifications/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getNotificationStats() {
    return api("/api/notifications/stats");
  },

  clearAllNotifications() {
    return api("/api/notifications", { method: "DELETE" });
  },
};
