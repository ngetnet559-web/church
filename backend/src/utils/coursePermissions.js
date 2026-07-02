import { ROLES } from '../constants/roles.js';

export const isAdminRole = (role) =>
  role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;

export const canManageCourse = (user, course) => {
  if (isAdminRole(user.role)) {
    return true;
  }
  if (user.role === ROLES.TEACHER) {
    return course.createdBy.toString() === user._id.toString();
  }
  return false;
};

export const canDeleteCourse = (user) =>
  user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN;
