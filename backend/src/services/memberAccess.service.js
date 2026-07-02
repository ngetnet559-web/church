import mongoose from "mongoose";
import MemberProfile from "../models/MemberProfile.js";
import ParentPortalAccess from "../models/ParentPortalAccess.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";

export const MEMBER_USER_SELECT = "name email role isActive";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const isAdminRole = (user) =>
  [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role);

export const isStaffRole = (user) =>
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER].includes(user?.role);

export const memberPopulate = {
  path: "userId",
  select: MEMBER_USER_SELECT,
};

export const normalizeObjectId = (id, label = "id") => {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }

  return new mongoose.Types.ObjectId(id);
};

export const resolveMemberProfile = async (identifier, options = {}) => {
  const { createForUser = false, actorId = null } = options;

  if (!isValidObjectId(identifier)) {
    throw new ApiError(400, "Invalid member id");
  }

  let profile = await MemberProfile.findById(identifier).populate(
    memberPopulate,
  );

  if (!profile) {
    profile = await MemberProfile.findOne({ userId: identifier }).populate(
      memberPopulate,
    );
  }

  if (!profile && createForUser) {
    profile = await MemberProfile.create({
      userId: identifier,
      createdBy: actorId || identifier,
      updatedBy: actorId || identifier,
    });
    await profile.populate(memberPopulate);
  }

  if (!profile) {
    throw new ApiError(404, "Member profile not found");
  }

  return profile;
};

export const getMemberProfileByUserId = async (userId, options = {}) =>
  resolveMemberProfile(userId, { ...options, createForUser: true });

export const hasParentAccessToChildUser = async (parentUserId, childUserId) => {
  if (!isValidObjectId(parentUserId) || !isValidObjectId(childUserId)) {
    return false;
  }

  const access = await ParentPortalAccess.findOne({
    parentId: parentUserId,
    childId: childUserId,
    active: true,
  }).lean();

  return Boolean(access);
};

export const assertCanViewMemberProfile = async (currentUser, profile) => {
  if (!currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  if (isAdminRole(currentUser)) return;

  const memberUserId = profile.userId?._id || profile.userId;
  const memberRole = profile.userId?.role;

  if (memberUserId?.toString() === currentUser._id.toString()) return;

  if (currentUser.role === ROLES.TEACHER && memberRole === ROLES.STUDENT) {
    return;
  }

  if (
    currentUser.role === ROLES.PARENT &&
    (await hasParentAccessToChildUser(currentUser._id, memberUserId))
  ) {
    return;
  }

  throw new ApiError(403, "You do not have permission to view this profile");
};

export const assertCanUpdateMemberProfile = async (currentUser, profile) => {
  if (!currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  const memberUserId = profile.userId?._id || profile.userId;
  const memberRole = profile.userId?.role;
  const isSelf = memberUserId?.toString() === currentUser._id.toString();

  if (isAdminRole(currentUser)) return;

  if (currentUser.role === ROLES.STUDENT && !isSelf) {
    throw new ApiError(403, "You do not have permission to update this profile");
  }

  if (currentUser.role === ROLES.TEACHER && !isSelf) {
    throw new ApiError(403, "Teachers can only edit their own profile");
  }

  if (currentUser.role === ROLES.PARENT && !isSelf) {
    throw new ApiError(403, "Parents can only edit their own profile");
  }

  if (
    currentUser.role === ROLES.TEACHER &&
    [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(memberRole)
  ) {
    throw new ApiError(403, "Teachers cannot edit administrator profiles");
  }

  if (isSelf) return;

  throw new ApiError(403, "You do not have permission to update this profile");
};

export const assertCanDeleteMemberProfile = (currentUser) => {
  if (!currentUser) {
    throw new ApiError(401, "Authentication required");
  }

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only Super Admin can permanently delete profiles");
  }
};

export const assertCanViewStudentData = async (currentUser, profile) => {
  if (isAdminRole(currentUser)) return;

  const memberRole = profile.userId?.role;
  const memberUserId = profile.userId?._id || profile.userId;

  if (currentUser.role === ROLES.TEACHER && memberRole === ROLES.STUDENT) {
    return;
  }

  if (
    currentUser.role === ROLES.PARENT &&
    (await hasParentAccessToChildUser(currentUser._id, memberUserId))
  ) {
    return;
  }

  if (memberUserId?.toString() === currentUser._id.toString()) return;

  throw new ApiError(403, "You do not have permission to view this member data");
};

