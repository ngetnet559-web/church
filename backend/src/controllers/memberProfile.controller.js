import * as memberProfileService from "../services/memberProfile.service.js";

export const createProfile = async (req, res) => {
  const profile = await memberProfileService.createProfile(req.user, req.body);

  res.status(201).json({
    success: true,
    message: "Profile created successfully",
    data: profile,
  });
};

export const getProfiles = async (req, res) => {
  const result = await memberProfileService.getProfiles(req.user, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search || "",
    role: req.query.role || "",
    churchRole: req.query.churchRole || "",
    ministry: req.query.ministry || "",
    gender: req.query.gender || "",
    status: req.query.status || "",
    minAttendance: req.query.minAttendance || "",
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder || "desc",
  });

  res.json({
    success: true,
    data: result,
  });
};

export const getProfile = async (req, res) => {
  const profile = await memberProfileService.getProfile(req.user, req.params.id);

  res.json({
    success: true,
    data: profile,
  });
};

export const getMyProfile = async (req, res) => {
  const profile = await memberProfileService.getMyProfile(req.user);

  res.json({
    success: true,
    data: profile,
  });
};

export const updateProfile = async (req, res) => {
  const profile = await memberProfileService.updateProfile(
    req.user,
    req.params.id,
    req.body,
  );

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: profile,
  });
};

export const deleteProfile = async (req, res) => {
  const result = await memberProfileService.deleteProfile(req.user, req.params.id);

  res.json({
    success: true,
    message: result.message,
  });
};

export const getStatistics = async (req, res) => {
  const stats = await memberProfileService.getStatistics();

  res.json({
    success: true,
    data: stats,
  });
};

export const uploadProfilePhoto = async (req, res) => {
  const profile = await memberProfileService.uploadProfilePhoto(
    req.user,
    req.params.id,
    req.body,
  );

  res.json({
    success: true,
    message: "Profile photo updated successfully",
    data: profile,
  });
};

export const addAchievement = async (req, res) => {
  const profile = await memberProfileService.addAchievement(
    req.user,
    req.params.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Achievement added successfully",
    data: profile,
  });
};

export const removeAchievement = async (req, res) => {
  const profile = await memberProfileService.removeAchievement(
    req.user,
    req.params.id,
    req.params.achievementId,
  );

  res.json({
    success: true,
    message: "Achievement removed successfully",
    data: profile,
  });
};

export const addBadge = async (req, res) => {
  const profile = await memberProfileService.addBadge(req.user, req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: "Badge added successfully",
    data: profile,
  });
};

export const removeBadge = async (req, res) => {
  const profile = await memberProfileService.removeBadge(
    req.user,
    req.params.id,
    req.params.badgeId,
  );

  res.json({
    success: true,
    message: "Badge removed successfully",
    data: profile,
  });
};
