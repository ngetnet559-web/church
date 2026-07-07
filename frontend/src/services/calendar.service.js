import { api } from './api.js';

export const calendarService = {
  getCalendarEvents: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return api(`/api/events${query ? `?${query}` : ''}`);
  },
};
