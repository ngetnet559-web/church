import { api } from './api.js';

export const roomService = {
  getRooms: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return api(`/api/rooms${query ? `?${query}` : ''}`);
  },

  getRoomById: (id) => api(`/api/rooms/${id}`),

  createRoom: (data) => api('/api/rooms', { method: 'POST', body: JSON.stringify(data) }),

  updateRoom: (id, data) => api(`/api/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteRoom: (id) => api(`/api/rooms/${id}`, { method: 'DELETE' }),

  getRoomSchedule: (id, date) => api(`/api/rooms/${id}/schedule?date=${date}`),

  getRoomStats: () => api('/api/rooms/stats'),
};
