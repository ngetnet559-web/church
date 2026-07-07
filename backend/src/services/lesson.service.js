import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { ALL_CONTENT_TYPES, CONTENT_TYPES } from '../constants/contentTypes.js';
import { ROLES } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';
import { canManageCourse } from '../utils/coursePermissions.js';
import Enrollment from '../models/Enrollment.js'

const formatLesson = (lesson) => ({
  id: lesson._id,
  courseId: lesson.courseId,
  title: lesson.title,
  contentType: lesson.contentType,
  videoUrl: lesson.videoUrl,
  pdfUrl: lesson.pdfUrl,
  textContent: lesson.textContent,
  order: lesson.order,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt,
});

const validateLessonContent = (data) => {
  if (!data.title?.trim()) {
    throw new ApiError(400, 'Lesson title is required');
  }

  if (!ALL_CONTENT_TYPES.includes(data.contentType)) {
    throw new ApiError(400, 'Invalid content type');
  }

  if (data.contentType === CONTENT_TYPES.VIDEO && !data.videoUrl?.trim()) {
    throw new ApiError(400, 'Video URL is required for video lessons');
  }

  if (data.contentType === CONTENT_TYPES.PDF && !data.pdfUrl?.trim()) {
    throw new ApiError(400, 'PDF URL is required for PDF lessons');
  }

  if (data.contentType === CONTENT_TYPES.TEXT && !data.textContent?.trim()) {
    throw new ApiError(400, 'Text content is required for text lessons');
  }
};

const getNextOrder = async (courseId) => {
  const lastLesson = await Lesson.findOne({ courseId }).sort({ order: -1 });
  return lastLesson ? lastLesson.order + 1 : 1;
};

export const createLesson = async (user, courseId, data) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  if (!canManageCourse(user, course)) {
    throw new ApiError(403, 'You do not have permission to add lessons to this course');
  }

  validateLessonContent(data);

  const lesson = await Lesson.create({
    courseId,
    title: data.title.trim(),
    contentType: data.contentType,
    videoUrl: data.videoUrl?.trim() || '',
    pdfUrl: data.pdfUrl?.trim() || '',
    textContent: data.textContent?.trim() || '',
    order: data.order ?? (await getNextOrder(courseId)),
  });

  import("../services/autoNotification.service.js").then(m => m.notifyLessonAdded(lesson, course)).catch(() => {});
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Create", module: "Lesson", targetCollection: "Lesson", targetId: lesson._id, description: `Lesson "${lesson.title}" created in course ${course.title}` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "lesson_created", module: "Lesson", description: `${user.name} created lesson "${lesson.title}"`, targetId: lesson._id, targetModel: "Lesson" })).catch(() => {});
  return formatLesson(lesson);
};

export const getLessonsByCourse = async (user, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  if (user.role === ROLES.STUDENT) {
    const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled to view lessons');
    }
  }

  const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
  return lessons.map(formatLesson);
};

export const getLessonById = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }
  return formatLesson(lesson);
};

export const updateLesson = async (user, lessonId, data) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const course = await Course.findById(lesson.courseId);
  if (!canManageCourse(user, course)) {
    throw new ApiError(403, 'You do not have permission to update this lesson');
  }

  const merged = {
    title: data.title ?? lesson.title,
    contentType: data.contentType ?? lesson.contentType,
    videoUrl: data.videoUrl ?? lesson.videoUrl,
    pdfUrl: data.pdfUrl ?? lesson.pdfUrl,
    textContent: data.textContent ?? lesson.textContent,
  };

  validateLessonContent(merged);

  lesson.title = merged.title.trim();
  lesson.contentType = merged.contentType;
  lesson.videoUrl = merged.videoUrl.trim();
  lesson.pdfUrl = merged.pdfUrl.trim();
  lesson.textContent = merged.textContent.trim();
  if (data.order !== undefined) lesson.order = data.order;

  await lesson.save();
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Update", module: "Lesson", targetCollection: "Lesson", targetId: lesson._id, description: `Lesson "${lesson.title}" updated` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "lesson_updated", module: "Lesson", description: `${user.name} updated lesson "${lesson.title}"`, targetId: lesson._id, targetModel: "Lesson" })).catch(() => {});
  return formatLesson(lesson);
};

export const deleteLesson = async (user, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const course = await Course.findById(lesson.courseId);
  if (!canManageCourse(user, course)) {
    throw new ApiError(403, 'You do not have permission to delete this lesson');
  }

  await lesson.deleteOne();
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Delete", module: "Lesson", targetCollection: "Lesson", targetId: lessonId, description: `Lesson deleted from course` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "lesson_deleted", module: "Lesson", description: `${user.name} deleted lesson`, targetId: lessonId, targetModel: "Lesson" })).catch(() => {});
  return { message: 'Lesson deleted successfully' };
};
