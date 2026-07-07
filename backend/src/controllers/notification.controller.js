import * as notificationService from "../services/notification.service.js";
import { ApiError } from "../utils/ApiError.js";

export const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, isRead, category, priority, type, search } = req.query;

  const data = await notificationService.getNotifications({
    userId: req.user._id,
    page: parseInt(page),
    limit: parseInt(limit),
    isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
    category,
    priority,
    type,
    search,
  });

  res.json({ success: true, data });
};

export const getUnreadNotifications = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const notifications = await notificationService.getUnreadNotifications(req.user._id, limit);

  res.json({ success: true, data: notifications });
};

export const getUnreadCount = async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  res.json({ success: true, data: { count } });
};

export const markAsRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.json({ success: true, data: notification });
};

export const markAllAsRead = async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  res.json({ success: true, data: result });
};

export const deleteNotification = async (req, res) => {
  const notification = await notificationService.deleteNotification(req.params.id, req.user._id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.json({ success: true, data: { message: "Notification deleted" } });
};

export const getNotificationStats = async (req, res) => {
  const stats = await notificationService.getNotificationStats(req.user._id);
  res.json({ success: true, data: stats });
};

export const clearAllNotifications = async (req, res) => {
  await notificationService.clearAllNotifications(req.user._id);
  res.json({ success: true, data: { message: "All notifications cleared" } });
};

export const createNotification = async (req, res) => {
  const { recipient, title, message, type, category, priority, icon, color, link, metadata, expiresAt } = req.body;

  if (!recipient || !title || !message) {
    throw new ApiError(400, "Recipient, title, and message are required");
  }

  const notification = await notificationService.createNotification({
    recipient,
    sender: req.user._id,
    title,
    message,
    type,
    category,
    priority,
    icon,
    color,
    link,
    metadata,
    expiresAt,
  });

  res.status(201).json({ success: true, data: notification });
};

export const createBulkNotification = async (req, res) => {
  const { recipients, role, title, message, type, category, priority, icon, color, link, metadata, expiresAt } = req.body;

  if (!title || !message) {
    throw new ApiError(400, "Title and message are required");
  }

  let result;

  if (role) {
    result = await notificationService.notifyRole({
      role,
      sender: req.user._id,
      title,
      message,
      type,
      category,
      priority,
      icon,
      color,
      link,
      metadata,
      expiresAt,
    });
  } else if (recipients && recipients.length > 0) {
    result = await notificationService.notifyUsers({
      userIds: recipients,
      sender: req.user._id,
      title,
      message,
      type,
      category,
      priority,
      icon,
      color,
      link,
      metadata,
      expiresAt,
    });
  } else {
    result = await notificationService.notifyAll({
      sender: req.user._id,
      title,
      message,
      type,
      category,
      priority,
      icon,
      color,
      link,
      metadata,
      expiresAt,
    });
  }

  res.status(201).json({ success: true, data: { count: result.length } });
};
