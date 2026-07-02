import { api } from './api.js';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const memberProfileService = {
  getProfiles: (params = {}) => api(`/api/member-profiles${buildQuery(params)}`),

  getProfile: (id) => api(`/api/member-profiles/${id}`),

  getMyProfile: () => api('/api/member-profiles/me'),

  createProfile: (data) =>
    api('/api/member-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfile: (id, data) =>
    api(`/api/member-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProfile: (id) =>
    api(`/api/member-profiles/${id}`, {
      method: 'DELETE',
    }),

  getStatistics: () => api('/api/member-profiles/stats'),

  uploadProfilePhoto: (id, profilePhoto) =>
    api(`/api/member-profiles/${id}/photo`, {
      method: 'POST',
      body: JSON.stringify({ profilePhoto }),
    }),

  addAchievement: (id, data) =>
    api(`/api/member-profiles/${id}/achievements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeAchievement: (id, achievementId) =>
    api(`/api/member-profiles/${id}/achievements/${achievementId}`, {
      method: 'DELETE',
    }),

  addBadge: (id, data) =>
    api(`/api/member-profiles/${id}/badges`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeBadge: (id, badgeId) =>
    api(`/api/member-profiles/${id}/badges/${badgeId}`, {
      method: 'DELETE',
    }),
};
