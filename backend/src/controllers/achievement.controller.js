import * as achievementService from "../services/achievement.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Create achievement
 * @route POST /api/achievements
 */
export const createAchievement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    icon,
    points,
    badgeColor,
    automatic,
    requirements,
  } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const achievement = await achievementService.createAchievement(req.user, {
    title,
    description,
    icon,
    points,
    badgeColor,
    automatic,
    requirements,
  });

  res.status(201).json({
    success: true,
    data: achievement,
  });
});

/**
 * Get all achievements
 * @route GET /api/achievements
 */
export const getAchievements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, automatic } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  if (automatic !== undefined) {
    query.automatic = automatic === "true";
  }

  const result = await achievementService.getAchievements(query, skip, limit);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page,
      limit,
    },
  });
});

/**
 * Get single achievement
 * @route GET /api/achievements/:id
 */
export const getAchievement = asyncHandler(async (req, res) => {
  const achievement = await achievementService.getAchievement(req.params.id);

  res.status(200).json({
    success: true,
    data: achievement,
  });
});

/**
 * Update achievement
 * @route PUT /api/achievements/:id
 */
export const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await achievementService.updateAchievement(
    req.params.id,
    req.user,
    req.body,
  );

  res.status(200).json({
    success: true,
    data: achievement,
  });
});

/**
 * Delete achievement
 * @route DELETE /api/achievements/:id
 */
export const deleteAchievement = asyncHandler(async (req, res) => {
  const result = await achievementService.deleteAchievement(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * Get automatic achievements
 * @route GET /api/achievements/auto/list
 */
export const getAutomaticAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementService.getAutomaticAchievements();

  res.status(200).json({
    success: true,
    data: achievements,
  });
});

/**
 * Seed default achievements
 * @route POST /api/achievements/seed/defaults
 */
export const seedAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementService.seedDefaultAchievements(
    req.user,
  );

  res.status(201).json({
    success: true,
    message: `Seeded ${achievements.length} default achievements`,
    data: achievements,
  });
});
