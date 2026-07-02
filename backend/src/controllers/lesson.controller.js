import * as lessonService from '../services/lesson.service.js';

export const createLesson = async (req, res) => {
  const lesson = await lessonService.createLesson(req.user, req.params.id, req.body);
  res.status(201).json({ success: true, data: { lesson } });
};

export const getLessons = async (req, res) => {
  const lessons = await lessonService.getLessonsByCourse(req.user, req.params.id);
  res.status(200).json({ success: true, data: { lessons } });
};

export const updateLesson = async (req, res) => {
  const lesson = await lessonService.updateLesson(req.user, req.params.id, req.body);
  res.status(200).json({ success: true, data: { lesson } });
};

export const deleteLesson = async (req, res) => {
  const result = await lessonService.deleteLesson(req.user, req.params.id);
  res.status(200).json({ success: true, data: result });
};
