import Notification from "../models/Notification.js";
import notificationEmitter, { NOTIFICATION_EVENTS } from "./notificationEventEmitter.js";

const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = "info",
  category = "System",
  priority = "normal",
  icon = "",
  color = "",
  link = "",
  metadata = {},
  expiresAt = null,
}) => {
  const notification = await Notification.create({
    recipient,
    sender,
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

  notificationEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_CREATED, notification);

  import("../services/audit.service.js").then(m => m.logAudit({ user: sender ? { _id: sender } : null, action: "Send", module: "Notification", targetCollection: "Notification", targetId: notification._id, description: `Notification "${title}" sent to ${recipient}` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user: sender ? { _id: sender } : null, activityType: "notification_sent", module: "Notification", description: `Notification "${title}" sent`, targetId: notification._id, targetModel: "Notification" })).catch(() => {});
  return notification;
};

const createBulkNotification = async ({ recipients, sender = null, title, message, type, category, priority, icon, color, link, metadata, expiresAt }) => {
  const notifications = recipients.map((recipient) => ({
    recipient,
    sender,
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
  }));

  const created = await Notification.insertMany(notifications);

  notificationEmitter.emit(NOTIFICATION_EVENTS.BULK_NOTIFICATION, created);

  import("../services/audit.service.js").then(m => m.logAudit({ user: sender ? { _id: sender } : null, action: "Send", module: "Notification", targetCollection: "Notification", description: `Bulk notification "${title}" sent to ${recipients.length} recipients` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user: sender ? { _id: sender } : null, activityType: "notification_sent", module: "Notification", description: `Bulk notification "${title}" sent to ${recipients.length} recipients` })).catch(() => {});
  return created;
};

const notifyRole = async ({ role, sender = null, title, message, type, category, priority, icon, color, link, metadata, expiresAt }) => {
  const User = (await import("../models/User.js")).default;
  const users = await User.find({ role, isActive: true }).select("_id");
  const recipients = users.map((u) => u._id);

  if (recipients.length === 0) return [];

  return createBulkNotification({
    recipients,
    sender,
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
};

const notifyUsers = async ({ userIds, sender = null, title, message, type, category, priority, icon, color, link, metadata, expiresAt }) => {
  return createBulkNotification({
    recipients: userIds,
    sender,
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
};

const notifyAll = async ({ sender = null, title, message, type, category, priority, icon, color, link, metadata, expiresAt }) => {
  const User = (await import("../models/User.js")).default;
  const users = await User.find({ isActive: true }).select("_id");
  const recipients = users.map((u) => u._id);

  if (recipients.length === 0) return [];

  return createBulkNotification({
    recipients,
    sender,
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
};

const getNotifications = async ({ userId, page = 1, limit = 20, isRead, category, priority, type, search }) => {
  const filter = { recipient: userId };

  if (isRead !== undefined) filter.isRead = isRead;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name email")
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    unreadCount: await Notification.countDocuments({ recipient: userId, isRead: false }),
  };
};

const getUnreadNotifications = async (userId, limit = 10) => {
  const notifications = await Notification.find({ recipient: userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name email")
    .lean();

  return notifications;
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (notification) {
    notificationEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_READ, notification);
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  notificationEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_READ_ALL, { userId, count: result.modifiedCount });

  return result;
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });

  if (notification) {
    notificationEmitter.emit(NOTIFICATION_EVENTS.NOTIFICATION_DELETED, notification);
  }

  return notification;
};

const clearExpiredNotifications = async () => {
  const result = await Notification.deleteMany({
    expiresAt: { $ne: null, $lte: new Date() },
  });

  return result;
};

const clearAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ recipient: userId });
  return result;
};

const getNotificationStats = async (userId) => {
  const [total, unread, byCategory, byPriority, byType, recent] = await Promise.all([
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    Notification.aggregate([
      { $match: { recipient: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Notification.aggregate([
      { $match: { recipient: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Notification.aggregate([
      { $match: { recipient: userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title message category isRead createdAt type")
      .lean(),
  ]);

  return {
    total,
    unread,
    read: total - unread,
    unreadPercentage: total === 0 ? 0 : Math.round((unread / total) * 100),
    readPercentage: total === 0 ? 0 : Math.round(((total - unread) / total) * 100),
    byCategory,
    byPriority,
    byType,
    recent,
  };
};

export {
  createNotification,
  createBulkNotification,
  notifyRole,
  notifyUsers,
  notifyAll,
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearExpiredNotifications,
  clearAllNotifications,
  getNotificationStats,
};
