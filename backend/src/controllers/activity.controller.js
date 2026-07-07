import * as activityService from "../services/activity.service.js";
import { ROLES } from "../constants/roles.js";

export const getActivities = async (req, res) => {
  const { page, limit, activityType, module } = req.query;
  const filters = { page: parseInt(page) || 1, limit: parseInt(limit) || 20, activityType, module };

  if (req.user.role === ROLES.TEACHER || req.user.role === ROLES.STUDENT || req.user.role === ROLES.PARENT) {
    filters.userId = req.user._id;
  }

  const result = await activityService.getRecentActivities(filters);
  res.json({ success: true, data: result });
};

export const getRecentActivities = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const filters = { limit };

  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN) {
    filters.userId = req.user._id;
  }

  const result = await activityService.getRecentActivities(filters);
  res.json({ success: true, data: result });
};

export const getActivityTimeline = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const filters = { days };

  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN) {
    filters.userId = req.user._id;
  }

  const result = await activityService.getActivityTimeline(filters);
  res.json({ success: true, data: result });
};

export const getActivityStats = async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const stats = await activityService.getActivityStats({ days });
  res.json({ success: true, data: stats });
};
