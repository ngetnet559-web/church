import mongoose from "mongoose";
import MemberProfile from "../models/MemberProfile.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Attendance from "../models/Attendance.js";
import Certificate from "../models/Certificate.js";
import Donation from "../models/Donation.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import {
  assertCanViewMemberProfile,
  assertCanUpdateMemberProfile,
  assertCanDeleteMemberProfile,
  getMemberProfileByUserId,
  isAdminRole,
  isStaffRole,
} from "./memberAccess.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

const validateEmail = (email) => {
  if (!email) return;
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
};

const validatePhone = (phone, label = "Phone") => {
  if (!phone) return;
  if (!PHONE_REGEX.test(phone)) {
    throw new ApiError(400, `Invalid ${label} number format`);
  }
};

const validateDate = (value, label) => {
  if (!value) return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${label} date format`);
  }
};

const parseNameParts = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

const getFullName = (profile) => {
  const parts = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return parts || profile.userId?.name || "";
};

const syncMemberStats = async (userId) => {
  const [completedCourses, certificatesEarned, donationsCount, attendanceRecords] =
    await Promise.all([
      Enrollment.countDocuments({ userId, completed: true }),
      Certificate.countDocuments({ studentId: userId }),
      Donation.countDocuments({ memberId: userId }),
      Attendance.find({ studentId: userId }).select("status").lean(),
    ]);

  let attendanceScore = 0;
  if (attendanceRecords.length > 0) {
    const presentCount = attendanceRecords.filter(
      (record) => record.status === "Present" || record.status === "Late",
    ).length;
    attendanceScore = Math.round((presentCount / attendanceRecords.length) * 100);
  }

  return {
    completedCourses,
    certificatesEarned,
    donationsCount,
    attendanceScore,
  };
};

const formatProfile = (profile, stats = null) => ({
  id: profile._id,
  user: profile.userId
    ? {
        id: profile.userId._id,
        name: profile.userId.name,
        email: profile.userId.email,
        role: profile.userId.role,
      }
    : null,
  fullName: getFullName(profile),
  profilePhoto: profile.profilePhoto,
  firstName: profile.firstName,
  middleName: profile.middleName,
  lastName: profile.lastName,
  gender: profile.gender,
  birthDate: profile.birthDate,
  dateOfBirth: profile.birthDate,
  age: profile.age,
  phone: profile.phone,
  alternatePhone: profile.alternatePhone,
  email: profile.email || profile.userId?.email || "",
  address: profile.address,
  city: profile.city,
  region: profile.region,
  country: profile.country,
  occupation: profile.occupation,
  education: profile.education,
  bio: profile.bio,
  favoriteVerse: profile.favoriteVerse,
  favoriteBibleVerse: profile.favoriteVerse,
  churchRole: profile.churchRole,
  ministry: profile.ministry,
  joinedChurchDate: profile.joinedChurchDate,
  baptized: profile.baptized,
  baptismDate: profile.baptismDate,
  status: profile.status,
  skills: profile.skills || [],
  talents: profile.talents || [],
  interests: profile.interests || [],
  languages: profile.languages || [],
  emergencyContact: profile.emergencyContact,
  guardian: profile.guardian,
  parentUsers: profile.parentUsers,
  attendanceScore: stats?.attendanceScore ?? profile.attendanceScore ?? 0,
  completedCourses: stats?.completedCourses ?? profile.completedCourses ?? 0,
  certificatesEarned: stats?.certificatesEarned ?? profile.certificatesEarned ?? 0,
  donationsCount: stats?.donationsCount ?? profile.donationsCount ?? 0,
  volunteerHours: profile.volunteerHours ?? 0,
  badges: profile.badges || [],
  achievements: profile.achievements || [],
  ministries: profile.ministries,
  socialLinks: profile.socialLinks || {},
  visibility: profile.visibility,
  isPublic: profile.isPublic ?? profile.visibility === "Public",
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const populateProfile = (query) =>
  query
    .populate("userId", "name email role")
    .populate("parentUsers", "name email role");

const appendAuditTrail = (profile, action, changedFields, actorId) => {
  profile.auditTrail = profile.auditTrail || [];
  profile.auditTrail.push({
    action,
    changedFields,
    changedBy: actorId,
    changedAt: new Date(),
  });
};

const buildProfileQuery = async (filters = {}) => {
  const query = {};
  const userFilters = {};

  if (filters.role) userFilters.role = filters.role;
  if (filters.search) {
    userFilters.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (Object.keys(userFilters).length > 0) {
    const users = await User.find(userFilters).select("_id");
    query.userId = { $in: users.map((user) => user._id) };
  }

  if (filters.churchRole) {
    query.churchRole = { $regex: filters.churchRole, $options: "i" };
  }

  if (filters.ministry) {
    query.ministry = { $regex: filters.ministry, $options: "i" };
  }

  if (filters.gender) {
    query.gender = filters.gender;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.minAttendance !== undefined && filters.minAttendance !== "") {
    query.attendanceScore = { $gte: Number(filters.minAttendance) };
  }

  return query;
};

export const createProfile = async (currentUser, data) => {
  if (!isAdminRole(currentUser)) {
    throw new ApiError(403, "Only administrators can create member profiles");
  }

  if (!mongoose.Types.ObjectId.isValid(data.userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(data.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const exists = await MemberProfile.findOne({ userId: data.userId });
  if (exists) {
    throw new ApiError(409, "Profile already exists for this user");
  }

  validateEmail(data.email || user.email);
  validatePhone(data.phone);
  validatePhone(data.alternatePhone, "Alternate phone");
  validateDate(data.birthDate, "date of birth");
  validateDate(data.joinedChurchDate, "joined church date");
  validateDate(data.baptismDate, "baptism date");

  const nameParts = parseNameParts(data.firstName ? `${data.firstName} ${data.lastName || ""}` : user.name);

  const profile = await MemberProfile.create({
    userId: data.userId,
    profilePhoto: data.profilePhoto || "",
    firstName: data.firstName || nameParts.firstName,
    middleName: data.middleName || nameParts.middleName,
    lastName: data.lastName || nameParts.lastName,
    gender: data.gender,
    birthDate: data.birthDate,
    phone: data.phone || "",
    alternatePhone: data.alternatePhone || "",
    email: data.email || user.email,
    address: data.address || "",
    city: data.city || "",
    region: data.region || "",
    country: data.country || "",
    occupation: data.occupation || "",
    education: data.education || "",
    bio: data.bio || "",
    favoriteVerse: data.favoriteVerse || "",
    churchRole: data.churchRole || "",
    ministry: data.ministry || "",
    joinedChurchDate: data.joinedChurchDate,
    baptized: data.baptized ?? false,
    baptismDate: data.baptismDate,
    status: data.status || "Active",
    skills: data.skills || [],
    talents: data.talents || [],
    interests: data.interests || [],
    languages: data.languages || [],
    emergencyContact: data.emergencyContact || {},
    guardian: data.guardian || {},
    parentUsers: data.parentUsers || [],
    socialLinks: data.socialLinks || {},
    visibility: data.visibility || "Members",
    isPublic: data.isPublic ?? false,
    createdBy: currentUser._id,
    updatedBy: currentUser._id,
  });

  appendAuditTrail(profile, "CREATE", ["profile"], currentUser._id);
  await profile.save();
  await populateProfile(profile);

  const stats = await syncMemberStats(data.userId);
  Object.assign(profile, stats);
  await profile.save();

  return formatProfile(profile, stats);
};

export const getProfile = async (currentUser, profileId) => {
  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    throw new ApiError(400, "Invalid profile id");
  }

  const profile = await populateProfile(MemberProfile.findById(profileId));
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  await assertCanViewMemberProfile(currentUser, profile);

  const userId = profile.userId?._id || profile.userId;
  const stats = await syncMemberStats(userId);

  return formatProfile(profile, stats);
};

export const getMyProfile = async (currentUser) => {
  const profile = await getMemberProfileByUserId(currentUser._id, {
    actorId: currentUser._id,
  });

  const user = await User.findById(currentUser._id);
  if (user && !profile.firstName) {
    const nameParts = parseNameParts(user.name);
    profile.firstName = nameParts.firstName;
    profile.middleName = nameParts.middleName;
    profile.lastName = nameParts.lastName;
    profile.email = profile.email || user.email;
    profile.updatedBy = currentUser._id;
    await profile.save();
  }

  const stats = await syncMemberStats(currentUser._id);
  Object.assign(profile, stats);
  await profile.save();

  return formatProfile(profile, stats);
};

export const updateProfile = async (currentUser, profileId, data) => {
  const profile = await populateProfile(MemberProfile.findById(profileId));
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  await assertCanUpdateMemberProfile(currentUser, profile);

  validateEmail(data.email);
  validatePhone(data.phone);
  validatePhone(data.alternatePhone, "Alternate phone");
  validateDate(data.birthDate, "date of birth");
  validateDate(data.joinedChurchDate, "joined church date");
  validateDate(data.baptismDate, "baptism date");

  const changedFields = [];
  const assignField = (field, value) => {
    if (value !== undefined && profile[field] !== value) {
      profile[field] = value;
      changedFields.push(field);
    }
  };

  assignField("profilePhoto", data.profilePhoto);
  assignField("firstName", data.firstName);
  assignField("middleName", data.middleName);
  assignField("lastName", data.lastName);
  assignField("gender", data.gender);
  assignField("birthDate", data.birthDate ? new Date(data.birthDate) : undefined);
  assignField("phone", data.phone);
  assignField("alternatePhone", data.alternatePhone);
  assignField("email", data.email);
  assignField("address", data.address);
  assignField("city", data.city);
  assignField("region", data.region);
  assignField("country", data.country);
  assignField("occupation", data.occupation);
  assignField("education", data.education);
  assignField("bio", data.bio);
  assignField("favoriteVerse", data.favoriteVerse);
  assignField("churchRole", data.churchRole);
  assignField("ministry", data.ministry);
  assignField(
    "joinedChurchDate",
    data.joinedChurchDate ? new Date(data.joinedChurchDate) : undefined,
  );
  assignField("baptized", data.baptized);
  assignField("baptismDate", data.baptismDate ? new Date(data.baptismDate) : undefined);

  if (isAdminRole(currentUser)) {
    assignField("status", data.status);
    assignField("visibility", data.visibility);
    assignField("isPublic", data.isPublic);
    assignField("volunteerHours", data.volunteerHours);
  }

  if (data.skills !== undefined) {
    profile.skills = data.skills;
    changedFields.push("skills");
  }
  if (data.talents !== undefined) {
    profile.talents = data.talents;
    changedFields.push("talents");
  }
  if (data.interests !== undefined) {
    profile.interests = data.interests;
    changedFields.push("interests");
  }
  if (data.languages !== undefined) {
    profile.languages = data.languages;
    changedFields.push("languages");
  }
  if (data.socialLinks !== undefined) {
    profile.socialLinks = { ...profile.socialLinks, ...data.socialLinks };
    changedFields.push("socialLinks");
  }
  if (data.emergencyContact !== undefined) {
    profile.emergencyContact = { ...profile.emergencyContact, ...data.emergencyContact };
    changedFields.push("emergencyContact");
  }
  if (data.guardian !== undefined) {
    profile.guardian = { ...profile.guardian, ...data.guardian };
    changedFields.push("guardian");
  }

  profile.updatedBy = currentUser._id;

  if (changedFields.length > 0) {
    appendAuditTrail(profile, "UPDATE", changedFields, currentUser._id);
  }

  await profile.save();

  const userId = profile.userId?._id || profile.userId;
  const stats = await syncMemberStats(userId);
  Object.assign(profile, stats);
  await profile.save();

  return formatProfile(profile, stats);
};

export const deleteProfile = async (currentUser, profileId) => {
  assertCanDeleteMemberProfile(currentUser);

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    throw new ApiError(400, "Invalid profile id");
  }

  const profile = await MemberProfile.findById(profileId);
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  await profile.deleteOne();
  return { message: "Profile deleted successfully" };
};

export const getProfiles = async (currentUser, options = {}) => {
  if (!isStaffRole(currentUser)) {
    throw new ApiError(403, "You do not have permission to list member profiles");
  }

  return filterProfiles(options);
};

export const searchProfiles = async (currentUser, search, options = {}) =>
  getProfiles(currentUser, { ...options, search });

export const filterProfiles = async (options = {}) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? 1 : -1;

  const query = await buildProfileQuery(options);
  const skip = (page - 1) * limit;

  const [profiles, total] = await Promise.all([
    populateProfile(
      MemberProfile.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
    ),
    MemberProfile.countDocuments(query),
  ]);

  const formattedProfiles = await Promise.all(
    profiles.map(async (profile) => {
      const userId = profile.userId?._id || profile.userId;
      const stats = userId ? await syncMemberStats(userId) : null;
      return formatProfile(profile, stats);
    }),
  );

  return {
    profiles: formattedProfiles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const uploadProfilePhoto = async (currentUser, profileId, photoData) => {
  if (!photoData?.profilePhoto) {
    throw new ApiError(400, "Profile photo data is required");
  }

  return updateProfile(currentUser, profileId, {
    profilePhoto: photoData.profilePhoto,
  });
};

export const addAchievement = async (currentUser, profileId, achievement) => {
  if (!achievement?.title?.trim()) {
    throw new ApiError(400, "Achievement title is required");
  }

  const profile = await populateProfile(MemberProfile.findById(profileId));
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  await assertCanUpdateMemberProfile(currentUser, profile);

  profile.achievements.push({
    title: achievement.title.trim(),
    description: achievement.description || "",
    category: achievement.category || "General",
    earnedAt: achievement.earnedAt ? new Date(achievement.earnedAt) : new Date(),
  });

  appendAuditTrail(profile, "UPDATE", ["achievements"], currentUser._id);
  profile.updatedBy = currentUser._id;
  await profile.save();

  return formatProfile(profile);
};

export const removeAchievement = async (currentUser, profileId, achievementId) => {
  const profile = await populateProfile(MemberProfile.findById(profileId));
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  await assertCanUpdateMemberProfile(currentUser, profile);

  const index = profile.achievements.findIndex(
    (item) => item._id.toString() === achievementId,
  );

  if (index === -1) {
    throw new ApiError(404, "Achievement not found");
  }

  profile.achievements.splice(index, 1);
  appendAuditTrail(profile, "UPDATE", ["achievements"], currentUser._id);
  profile.updatedBy = currentUser._id;
  await profile.save();

  return formatProfile(profile);
};

export const addBadge = async (currentUser, profileId, badge) => {
  if (!badge?.name?.trim()) {
    throw new ApiError(400, "Badge name is required");
  }

  const profile = await populateProfile(MemberProfile.findById(profileId));
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  if (!isAdminRole(currentUser)) {
    throw new ApiError(403, "Only administrators can assign badges");
  }

  profile.badges.push({
    name: badge.name.trim(),
    description: badge.description || "",
    icon: badge.icon || "",
    earnedAt: badge.earnedAt ? new Date(badge.earnedAt) : new Date(),
  });

  appendAuditTrail(profile, "UPDATE", ["badges"], currentUser._id);
  profile.updatedBy = currentUser._id;
  await profile.save();

  return formatProfile(profile);
};

export const removeBadge = async (currentUser, profileId, badgeId) => {
  const profile = await populateProfile(MemberProfile.findById(profileId));
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  if (!isAdminRole(currentUser)) {
    throw new ApiError(403, "Only administrators can remove badges");
  }

  const index = profile.badges.findIndex((item) => item._id.toString() === badgeId);
  if (index === -1) {
    throw new ApiError(404, "Badge not found");
  }

  profile.badges.splice(index, 1);
  appendAuditTrail(profile, "UPDATE", ["badges"], currentUser._id);
  profile.updatedBy = currentUser._id;
  await profile.save();

  return formatProfile(profile);
};

export const getMemberStatistics = async () => {
  const [
    totalMembers,
    maleMembers,
    femaleMembers,
    volunteerHoursResult,
    attendanceAvgResult,
    certificatesIssued,
    completedCourses,
    totalDonationsCount,
    roleCounts,
  ] = await Promise.all([
    MemberProfile.countDocuments(),
    MemberProfile.countDocuments({ gender: "Male" }),
    MemberProfile.countDocuments({ gender: "Female" }),
    MemberProfile.aggregate([
      { $group: { _id: null, total: { $sum: "$volunteerHours" } } },
    ]),
    MemberProfile.aggregate([
      { $group: { _id: null, average: { $avg: "$attendanceScore" } } },
    ]),
    Certificate.countDocuments(),
    Enrollment.countDocuments({ completed: true }),
    Donation.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
  ]);

  const roleMap = roleCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalMembers,
    teachers: roleMap[ROLES.TEACHER] || 0,
    students: roleMap[ROLES.STUDENT] || 0,
    parents: roleMap[ROLES.PARENT] || 0,
    admins: (roleMap[ROLES.ADMIN] || 0) + (roleMap[ROLES.SUPER_ADMIN] || 0),
    maleMembers,
    femaleMembers,
    volunteerHours: volunteerHoursResult[0]?.total || 0,
    attendanceAverage: Math.round(attendanceAvgResult[0]?.average || 0),
    certificatesIssued,
    completedCourses,
    totalDonationsCount,
  };
};

export const getStatistics = getMemberStatistics;
