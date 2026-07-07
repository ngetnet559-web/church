import Announcement from "../models/Announcement.js";
import { notifyUsers } from "./notification.service.js";
import emailService from "./email.service.js";
import { ALL_ROLES } from "../constants/roles.js";

const createAnnouncement = async ({ title, description, content, createdBy, targetRoles, recipientIds, publishDate, expireDate, isPinned, attachments }) => {
  const announcement = await Announcement.create({
    title,
    description,
    content,
    createdBy,
    targetRoles: targetRoles?.length ? targetRoles : ALL_ROLES,
    publishDate: publishDate || new Date(),
    expireDate,
    isPinned: isPinned || false,
    attachments: attachments || [],
  });

  sendAnnouncementNotifications(announcement, recipientIds).catch(() => {});

  import("../services/audit.service.js").then(m => m.logAudit({ user: announcement.createdBy ? { _id: announcement.createdBy } : null, action: "Create", module: "Announcement", targetCollection: "Announcement", targetId: announcement._id, description: `Announcement "${announcement.title}" created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user: announcement.createdBy ? { _id: announcement.createdBy } : null, activityType: "announcement_published", module: "Announcement", description: `Announcement "${announcement.title}" published`, targetId: announcement._id, targetModel: "Announcement" })).catch(() => {});
  return announcement;
};

const sendAnnouncementNotifications = async (announcement, recipientIds) => {
  const User = (await import("../models/User.js")).default;

  const creatorId = announcement.createdBy?.toString();
  const targetedRoleUsers = announcement.targetRoles.length > 0
    ? await User.find({ role: { $in: announcement.targetRoles }, isActive: true }).select("_id email").lean()
    : [];

  let explicitUsers = [];
  if (recipientIds?.length) {
    explicitUsers = await User.find({ _id: { $in: recipientIds }, isActive: true }).select("_id email").lean();
  }

  const dedup = new Map();
  for (const u of [...targetedRoleUsers, ...explicitUsers]) {
    dedup.set(u._id.toString(), u);
  }
  dedup.delete(creatorId);

  const finalRecipients = [...dedup.values()];

  console.log("[Announcement Notification]");
  console.log("  creator:", creatorId);
  console.log("  targetRoles:", announcement.targetRoles);
  console.log("  recipientIds:", recipientIds);
  console.log("  finalRecipients:", finalRecipients.map((u) => ({ _id: u._id, email: u.email })));

  if (finalRecipients.length === 0) return;

  await notifyUsers({
    userIds: finalRecipients.map((u) => u._id),
    sender: announcement.createdBy,
    title: announcement.title,
    message: announcement.description,
    type: "info",
    category: "Announcement",
    priority: announcement.isPinned ? "high" : "normal",
    icon: "megaphone",
    color: "#6366f1",
    link: "/dashboard/announcements",
    metadata: { announcementId: announcement._id.toString() },
  });

  for (const user of finalRecipients) {
    try {
      await emailService.sendAnnouncementEmail(user, announcement);
    } catch {
      // Email failures are non-blocking
    }
  }
};

const getAnnouncements = async ({ page = 1, limit = 20, isActive, targetRole, search, isPinned }) => {
  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive;
  if (isPinned !== undefined) filter.isPinned = isPinned;

  const andConditions = [];

  if (targetRole) {
    andConditions.push({
      $or: [{ targetRoles: targetRole }, { targetRoles: [] }, { targetRoles: { $exists: false } }],
    });
  }

  if (search) {
    andConditions.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]);
  } else if (andConditions.length > 1) {
    filter.$and = andConditions;
  }

  const skip = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean(),
    Announcement.countDocuments(filter),
  ]);

  return {
    announcements,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const getActiveAnnouncements = async (targetRole) => {
  const now = new Date();
  const filter = {
    isActive: true,
    publishDate: { $lte: now },
  };

  const expireOr = [{ expireDate: null }, { expireDate: { $gte: now } }];

  const roleOr = targetRole
    ? [{ targetRoles: targetRole }, { targetRoles: [] }, { targetRoles: { $exists: false } }]
    : null;

  if (roleOr) {
    filter.$and = [{ $or: expireOr }, { $or: roleOr }];
  } else {
    filter.$or = expireOr;
  }

  return Announcement.find(filter)
    .sort({ isPinned: -1, publishDate: -1 })
    .populate("createdBy", "name email")
    .lean();
};

const getAnnouncementById = async (id) => {
  return Announcement.findById(id).populate("createdBy", "name email").lean();
};

const updateAnnouncement = async (id, data) => {
  const announcement = await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("createdBy", "name email")
    .lean();
  if (announcement) {
    import("../services/audit.service.js").then(m => m.logAudit({ action: "Update", module: "Announcement", targetCollection: "Announcement", targetId: announcement._id, description: `Announcement "${announcement.title}" updated` })).catch(() => {});
    import("../services/activity.service.js").then(m => m.logActivity({ activityType: "announcement_updated", module: "Announcement", description: `Announcement "${announcement.title}" updated`, targetId: announcement._id, targetModel: "Announcement" })).catch(() => {});
  }
  return announcement;
};

const deleteAnnouncement = async (id) => {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (announcement) {
    import("../services/audit.service.js").then(m => m.logAudit({ action: "Delete", module: "Announcement", targetCollection: "Announcement", targetId: id, description: `Announcement deleted` })).catch(() => {});
    import("../services/activity.service.js").then(m => m.logActivity({ activityType: "announcement_deleted", module: "Announcement", description: `Announcement deleted`, targetId: id, targetModel: "Announcement" })).catch(() => {});
  }
  return announcement;
};

export {
  createAnnouncement,
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
