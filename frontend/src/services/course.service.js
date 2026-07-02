import { api } from './api.js';

export const courseService = {
  getCourses: () => api('/api/courses'),

  getAvailableCourses: () => api('/api/courses/available'),

  getMyCourses: () => api('/api/my-courses'),

  getCourse: (id) => api(`/api/courses/${id}`),

  createCourse: (data) =>
    api('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourse: (id, data) =>
    api(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCourse: (id) =>
    api(`/api/courses/${id}`, {
      method: 'DELETE',
    }),

  getLessons: (courseId) => api(`/api/courses/${courseId}/lessons`),

  createLesson: (courseId, data) =>
    api(`/api/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLesson: (lessonId, data) =>
    api(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLesson: (lessonId) =>
    api(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    }),

  enroll: (courseId) =>
    api(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
    }),

  getEnrollments: (courseId) => api(`/api/enrollments/${courseId}`),

  updateProgress: (courseId, data) =>
    api(`/api/progress/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
