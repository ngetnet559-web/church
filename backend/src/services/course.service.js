import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import { ROLES } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';
import { canDeleteCourse, canManageCourse, isAdminRole } from '../utils/coursePermissions.js';

const populateCourse = { path: 'createdBy', select: 'name email role' };

const formatCourse = (course, extra = {}) => ({
  id: course._id,
  title: course.title,
  description: course.description,
  thumbnail: course.thumbnail,
  createdBy: course.createdBy
    ? {
        id: course.createdBy._id,
        name: course.createdBy.name,
        email: course.createdBy.email,
        role: course.createdBy.role,
      }
    : course.createdBy,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
  ...extra,
});

export const createCourse = async (user, data) => {
  const allowedRoles = [ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, 'You do not have permission to create courses');
  }

  if (!data.title?.trim()) {
    throw new ApiError(400, 'Course title is required');
  }

  const course = await Course.create({
    title: data.title.trim(),
    description: data.description?.trim() || '',
    thumbnail: data.thumbnail?.trim() || '',
    createdBy: user._id,
  });

  await course.populate(populateCourse);
  import("../services/autoNotification.service.js").then(m => m.notifyCourseCreated(course, user)).catch(() => {});
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Create", module: "Course", targetCollection: "Course", targetId: course._id, description: `Course "${course.title}" created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "course_created", module: "Course", description: `${user.name} created course "${course.title}"`, targetId: course._id, targetModel: "Course" })).catch(() => {});
  return formatCourse(course, { lessonCount: 0 });
};

export const getCourses = async (user) => {
  let courses;
  let enrollmentMap = new Map();

  if (user.role === ROLES.TEACHER) {
    courses = await Course.find({ createdBy: user._id }).populate(populateCourse).sort({ createdAt: -1 });
  } else if (user.role === ROLES.STUDENT) {
    const enrollments = await Enrollment.find({ userId: user._id }).populate({
      path: 'courseId',
      populate: populateCourse,
    });

    return enrollments
      .filter((e) => e.courseId)
      .map((enrollment) =>
        formatCourse(enrollment.courseId, {
          enrollment: {
            id: enrollment._id,
            progress: enrollment.progress,
            completed: enrollment.completed,
            enrolledAt: enrollment.enrolledAt,
            completedLessons: enrollment.completedLessons,
          },
        }),
      );
  } else if (user.role === ROLES.PARENT) {
    courses = await Course.find().populate(populateCourse).sort({ createdAt: -1 });
  } else {
    courses = await Course.find().populate(populateCourse).sort({ createdAt: -1 });
  }

  const courseIds = courses.map((c) => c._id);
  const lessonCounts = await Lesson.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(lessonCounts.map((l) => [l._id.toString(), l.count]));

  if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
    const enrollments = await Enrollment.find({ userId: user._id, courseId: { $in: courseIds } });
    enrollmentMap = new Map(enrollments.map((e) => [e.courseId.toString(), e]));
  }

  return courses.map((course) => {
    const enrollment = enrollmentMap.get(course._id.toString());
    return formatCourse(course, {
      lessonCount: countMap.get(course._id.toString()) || 0,
      ...(enrollment && {
        enrollment: {
          id: enrollment._id,
          progress: enrollment.progress,
          completed: enrollment.completed,
          enrolledAt: enrollment.enrolledAt,
          completedLessons: enrollment.completedLessons,
        },
      }),
    });
  });
};

export const getCourseById = async (user, courseId) => {
  // console.log("================================");
  // console.log("Requested Course ID:", courseId);

  const allCourses = await Course.find().select("_id title");
  // console.log("All courses in database:");
  // console.log(allCourses);

  const course = await Course.findById(courseId).populate(populateCourse);

  // console.log("Course found:");
  // console.log(course);
  // console.log("================================");

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (user.role === ROLES.STUDENT) {
    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId,
    });

    const lessonCount = await Lesson.countDocuments({ courseId });

    return formatCourse(course, {
      lessonCount,
      isEnrolled: Boolean(enrollment),
      ...(enrollment && {
        enrollment: {
          id: enrollment._id,
          progress: enrollment.progress,
          completed: enrollment.completed,
          enrolledAt: enrollment.enrolledAt,
          completedLessons: enrollment.completedLessons,
        },
      }),
    });
  }

  const lessonCount = await Lesson.countDocuments({ courseId });

  return formatCourse(course, {
    lessonCount,
  });
};

export const getAvailableCourses = async (user) => {
  if (user.role !== ROLES.STUDENT) {
    throw new ApiError(403, 'Only students can browse available courses');
  }

  const enrolled = await Enrollment.find({ userId: user._id }).select('courseId');
  const enrolledIds = enrolled.map((e) => e.courseId);

  const courses = await Course.find({ _id: { $nin: enrolledIds } })
    .populate(populateCourse)
    .sort({ createdAt: -1 });

  const courseIds = courses.map((c) => c._id);
  const lessonCounts = await Lesson.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(lessonCounts.map((l) => [l._id.toString(), l.count]));

  return courses.map((course) =>
    formatCourse(course, { lessonCount: countMap.get(course._id.toString()) || 0 }),
  );
};

export const updateCourse = async (user, courseId, data) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  if (!canManageCourse(user, course)) {
    throw new ApiError(403, 'You do not have permission to update this course');
  }

  if (data.title !== undefined) course.title = data.title.trim();
  if (data.description !== undefined) course.description = data.description.trim();
  if (data.thumbnail !== undefined) course.thumbnail = data.thumbnail.trim();

  await course.save();
  await course.populate(populateCourse);

  import("../services/autoNotification.service.js").then(m => m.notifyCourseCreated(course, user)).catch(() => {});
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Update", module: "Course", targetCollection: "Course", targetId: course._id, description: `Course "${course.title}" updated` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "course_updated", module: "Course", description: `${user.name} updated course "${course.title}"`, targetId: course._id, targetModel: "Course" })).catch(() => {});

  const lessonCount = await Lesson.countDocuments({ courseId });
  return formatCourse(course, { lessonCount });
};

export const deleteCourse = async (user, courseId) => {
  if (!canDeleteCourse(user)) {
    throw new ApiError(403, 'You do not have permission to delete courses');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  await Lesson.deleteMany({ courseId });
  await Enrollment.deleteMany({ courseId });
  await course.deleteOne();

  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Delete", module: "Course", targetCollection: "Course", targetId: courseId, description: `Course deleted` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "course_deleted", module: "Course", description: `${user.name} deleted course`, targetId: courseId, targetModel: "Course" })).catch(() => {});

  return { message: 'Course deleted successfully' };
};
