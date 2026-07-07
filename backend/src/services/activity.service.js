import SystemActivity from "../models/SystemActivity.js";
import { ROLES } from "../constants/roles.js";

export async function logActivity({
  user = null,
  activityType,
  module,
  description = "",
  targetId = null,
  targetModel = "",
  metadata = {},
  ipAddress = "",
} = {}) {
  try {
    await SystemActivity.create({
      user: user?._id || user || null,
      activityType,
      module,
      description,
      targetId,
      targetModel,
      metadata,
      ipAddress,
    });
  } catch {
    // non-blocking
  }
}

export async function getRecentActivities({
  page = 1,
  limit = 20,
  userId,
  activityType,
  module,
} = {}) {
  const query = {};
  if (userId) query.user = userId;
  if (activityType) query.activityType = activityType;
  if (module) query.module = module;

  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    SystemActivity.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SystemActivity.countDocuments(query),
  ]);

  return {
    activities: activities.map((a) => ({
      id: a._id,
      user: a.user
        ? { id: a.user._id, name: a.user.name, email: a.user.email, role: a.user.role }
        : null,
      activityType: a.activityType,
      module: a.module,
      description: a.description,
      targetId: a.targetId,
      targetModel: a.targetModel,
      metadata: a.metadata,
      createdAt: a.createdAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getActivityTimeline({
  userId,
  limit = 50,
  days = 7,
} = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const query = { createdAt: { $gte: since } };
  if (userId) query.user = userId;

  const activities = await SystemActivity.find(query)
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const grouped = {};
  for (const a of activities) {
    const dateKey = new Date(a.createdAt).toISOString().slice(0, 10);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push({
      id: a._id,
      user: a.user ? { name: a.user.name, role: a.user.role } : null,
      activityType: a.activityType,
      module: a.module,
      description: a.description,
      createdAt: a.createdAt,
    });
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

export async function getActivityStats({ days = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [total, byType, byModule, daily] = await Promise.all([
    SystemActivity.countDocuments({ createdAt: { $gte: since } }),
    SystemActivity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$activityType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    SystemActivity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$module", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    SystemActivity.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { total, byType, byModule, daily };
}

export async function getSelfActivity(userId, { page = 1, limit = 20 } = {}) {
  return getRecentActivities({ userId, page, limit });
}
