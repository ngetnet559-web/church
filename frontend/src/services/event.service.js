import { api } from './api.js';

export const eventService = {
  getEvents: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return api(`/api/events${query ? `?${query}` : ''}`);
  },

  getEventById: (id) => api(`/api/events/${id}`),

  createEvent: (data) => api('/api/events', { method: 'POST', body: JSON.stringify(data) }),

  updateEvent: (id, data) => api(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteEvent: (id) => api(`/api/events/${id}`, { method: 'DELETE' }),

  cancelEvent: (id, reason) => api(`/api/events/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

  duplicateEvent: (id) => api(`/api/events/${id}/duplicate`, { method: 'POST' }),

  rsvpEvent: (id, status) => api(`/api/events/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) }),

  getRegistrations: (id) => api(`/api/events/${id}/registrations`),

  getMyRegistrations: () => api('/api/events/my/registrations'),

  getUpcomingEvents: (limit) => api(`/api/events/upcoming${limit ? `?limit=${limit}` : ''}`),

  getTodaysEvents: () => api('/api/events/today'),
};
