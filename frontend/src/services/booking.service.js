import { api } from './api.js';

export const bookingService = {
  getBookings: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return api(`/api/bookings${query ? `?${query}` : ''}`);
  },

  getMyBookings: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return api(`/api/bookings/my${query ? `?${query}` : ''}`);
  },

  createBooking: (data) => api('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  updateBooking: (id, data) => api(`/api/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteBooking: (id) => api(`/api/bookings/${id}`, { method: 'DELETE' }),

  approveBooking: (id) => api(`/api/bookings/${id}/approve`, { method: 'POST' }),

  rejectBooking: (id, reason) => api(`/api/bookings/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
};
