import { api } from './api.js';

export const authService = {
  login: (credentials) =>
    api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => api('/api/auth/me'),

  logout: () =>
    api('/api/auth/logout', {
      method: 'POST',
    }),
};

export const adminService = {
  createUser: (userData) =>
    api('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getUsers: () => api('/api/admin/users'),

  updateUser: (id, updates) =>
    api(`/api/admin/user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deactivateUser: (id) =>
    api(`/api/admin/user/${id}`, {
      method: 'DELETE',
    }),
};
