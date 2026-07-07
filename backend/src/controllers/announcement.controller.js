import * as announcementService from "../services/announcement.service.js";
import { ApiError } from "../utils/ApiError.js";

export const createAnnouncement = async (req, res) => {
  const { title, description, content, targetRoles, recipientIds, publishDate, expireDate, isPinned, attachments } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const announcement = await announcementService.createAnnouncement({
    title,
    description,
    content,
    createdBy: req.user._id,
    targetRoles,
    recipientIds,
    publishDate,
    expireDate,
    isPinned,
    attachments,
  });

  res.status(201).json({ success: true, data: announcement });
};

export const getAnnouncements = async (req, res) => {
  const { page = 1, limit = 20, isActive, search, isPinned } = req.query;

  const data = await announcementService.getAnnouncements({
    page: parseInt(page),
    limit: parseInt(limit),
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    targetRole: req.user.role,
    search,
    isPinned: isPinned === "true" ? true : isPinned === "false" ? false : undefined,
  });

  res.json({ success: true, data });
};

export const getActiveAnnouncements = async (req, res) => {
  const announcements = await announcementService.getActiveAnnouncements(req.user.role);

  res.json({ success: true, data: announcements });
};

export const getAnnouncementById = async (req, res) => {
  const announcement = await announcementService.getAnnouncementById(req.params.id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.json({ success: true, data: announcement });
};

export const updateAnnouncement = async (req, res) => {
  const { title, description, content, targetRoles, publishDate, expireDate, isPinned, isActive, attachments } = req.body;

  const announcement = await announcementService.updateAnnouncement(req.params.id, {
    title,
    description,
    content,
    targetRoles,
    publishDate,
    expireDate,
    isPinned,
    isActive,
    attachments,
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.json({ success: true, data: announcement });
};

export const deleteAnnouncement = async (req, res) => {
  const announcement = await announcementService.deleteAnnouncement(req.params.id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  res.json({ success: true, data: { message: "Announcement deleted" } });
};
