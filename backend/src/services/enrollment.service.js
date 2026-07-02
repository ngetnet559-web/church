import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { isAdminRole } from "../utils/coursePermissions.js";

const populateCourse = {
  path: "courseId",
  populate: { path: "createdBy", select: "name email role" },
};

const formatEnrollment = (enrollment) => ({
  id: enrollment._id,
  userId: enrollment.userId,
  courseId: enrollment.courseId?._id || enrollment.courseId,
  course: enrollment.courseId?.title
    ? {
        id: enrollment.courseId._id,
        title: enrollment.courseId.title,
        description: enrollment.courseId.description,
        thumbnail: enrollment.courseId.thumbnail,
        createdBy: enrollment.courseId.createdBy,
      }
    : undefined,
  enrolledAt: enrollment.enrolledAt,
  progress: enrollment.progress,
  completed: enrollment.completed,
  completedLessons: enrollment.completedLessons,
});

const calculateProgress = async (enrollment, courseId) => {
  const totalLessons = await Lesson.countDocuments({ courseId });
  if (totalLessons === 0) {
    enrollment.progress = 0;
    enrollment.completed = false;
    return;
  }

  const completedCount = enrollment.completedLessons.length;
  enrollment.progress = Math.round((completedCount / totalLessons) * 100);
  enrollment.completed = enrollment.progress === 100;
};

export const enrollInCourse = async (user, courseId) => {
  if (user.role !== ROLES.STUDENT) {
    throw new ApiError(403, "Only students can enroll in courses");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const existing = await Enrollment.findOne({ userId: user._id, courseId });
  if (existing) {
    throw new ApiError(409, "Already enrolled in this course");
  }

  const enrollment = await Enrollment.create({
    userId: user._id,
    courseId,
  });

  await enrollment.populate(populateCourse);
  return formatEnrollment(enrollment);
};

export const getMyCourses = async (user) => {
  const enrollments = await Enrollment.find({ userId: user._id })
    .populate(populateCourse)
    .sort({ enrolledAt: -1 });

  const courseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);
  const lessonCounts = await Lesson.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(
    lessonCounts.map((l) => [l._id.toString(), l.count]),
  );

  return enrollments
    .filter((e) => e.courseId)
    .map((enrollment) => ({
      ...formatEnrollment(enrollment),
      lessonCount: countMap.get(enrollment.courseId._id.toString()) || 0,
    }));
};

export const getEnrollmentsByCourse = async (user, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const isOwner = course.createdBy.toString() === user._id.toString();
  const canView =
    isAdminRole(user.role) ||
    isOwner ||
    user.role === ROLES.TEACHER ||
    user.role === ROLES.PARENT;

  if (!canView) {
    throw new ApiError(403, "You do not have permission to view enrollments");
  }

  if (user.role === ROLES.TEACHER && !isOwner) {
    throw new ApiError(
      403,
      "You can only view enrollments for your own courses",
    );
  }

  const enrollments = await Enrollment.find({ courseId })
    .populate("userId", "name email role")
    .sort({ enrolledAt: -1 });

  return enrollments.map((enrollment) => ({
    id: enrollment._id,
    user: {
      id: enrollment.userId._id,
      name: enrollment.userId.name,
      email: enrollment.userId.email,
      role: enrollment.userId.role,
    },
    enrolledAt: enrollment.enrolledAt,
    progress: enrollment.progress,
    completed: enrollment.completed,
    completedLessons: enrollment.completedLessons,
  }));
};

export const updateProgress = async (
  user,
  courseId,
  { lessonId, completed },
) => {
  if (user.role !== ROLES.STUDENT) {
    throw new ApiError(403, "Only students can update learning progress");
  }

  const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
  if (!enrollment) {
    throw new ApiError(404, "Enrollment not found");
  }

  const lesson = await Lesson.findOne({ _id: lessonId, courseId });
  if (!lesson) {
    throw new ApiError(404, "Lesson not found in this course");
  }

  const lessonIdStr = lessonId.toString();
  const isCompleted = enrollment.completedLessons.some(
    (id) => id.toString() === lessonIdStr,
  );

  if (completed && !isCompleted) {
    enrollment.completedLessons.push(lesson._id);
  } else if (!completed && isCompleted) {
    enrollment.completedLessons = enrollment.completedLessons.filter(
      (id) => id.toString() !== lessonIdStr,
    );
  }

  await calculateProgress(enrollment, courseId);
  await enrollment.save();

  if (enrollment.completed) {
    const { issueCertificateForEnrollment } =
      await import("./certificate.service.js");
    await issueCertificateForEnrollment(enrollment);
  }

  return formatEnrollment(enrollment);
};

export const getStudentEnrollment = async (user, courseId) => {
  const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
  if (!enrollment) {
    return null;
  }
  return formatEnrollment(enrollment);
};
