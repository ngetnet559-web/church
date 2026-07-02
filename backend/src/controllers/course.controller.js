import * as courseService from '../services/course.service.js';

export const createCourse = async (req, res) => {
  const course = await courseService.createCourse(req.user, req.body);
  res.status(201).json({ success: true, data: { course } });
};

export const getCourses = async (req, res) => {
  const courses = await courseService.getCourses(req.user);
  res.status(200).json({ success: true, data: { courses } });
};

export const getAvailableCourses = async (req, res) => {
  const courses = await courseService.getAvailableCourses(req.user);
  res.status(200).json({ success: true, data: { courses } });
};

export const getCourseById = async (req, res) => {
  const course = await courseService.getCourseById(req.user, req.params.id);
  res.status(200).json({ success: true, data: { course } });
};

export const updateCourse = async (req, res) => {
  const course = await courseService.updateCourse(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data: { course } });
};

export const deleteCourse = async (req, res) => {
  const result = await courseService.deleteCourse(req.user, req.params.id);
  res.status(200).json({ success: true, data: result });
};
