import { api } from './api.js';

export const attendanceService = {
  getSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/api/attendance/sessions${query ? `?${query}` : ''}`);
  },

  getSession: (id) => api(`/api/attendance/sessions/${id}`),

  createSession: (data) =>
    api('/api/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSession: (id, data) =>
    api(`/api/attendance/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSession: (id) =>
    api(`/api/attendance/sessions/${id}`, {
      method: 'DELETE',
    }),

  recordAttendance: (data) =>
    api('/api/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordBulkAttendance: (data) =>
    api('/api/attendance/bulk-checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStats: () => api('/api/attendance/stats'),

  searchStudents: (q) => {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return api(`/api/attendance/students${query}`);
  },

  getMyAttendance: (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return api(`/api/my-attendance${query}`);
  },

  getUpcomingSessions: () => api('/api/my-attendance/upcoming'),

  getCourseAttendance: (courseId) => api(`/api/my-attendance/course/${courseId}`),
};
