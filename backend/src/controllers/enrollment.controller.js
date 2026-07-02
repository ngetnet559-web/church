import * as enrollmentService from '../services/enrollment.service.js';

export const enroll = async (req, res) => {
  const enrollment = await enrollmentService.enrollInCourse(req.user, req.params.id);
  res.status(201).json({ success: true, data: { enrollment } });
};

export const getMyCourses = async (req, res) => {
  const courses = await enrollmentService.getMyCourses(req.user);
  res.status(200).json({ success: true, data: { courses } });
};

export const getEnrollments = async (req, res) => {
  const enrollments = await enrollmentService.getEnrollmentsByCourse(
    req.user,
    req.params.courseId,
  );
  res.status(200).json({ success: true, data: { enrollments } });
};

export const updateProgress = async (req, res) => {
  const enrollment = await enrollmentService.updateProgress(
    req.user,
    req.params.courseId,
    req.body,
  );
  res.status(200).json({ success: true, data: { enrollment } });
};
