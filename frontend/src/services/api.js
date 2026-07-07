import { storage } from '../utils/storage.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function buildHeaders(customHeaders = {}) {
  const token = storage.getToken();
  return {
    'Content-Type': 'application/json',
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleAuthError(status) {
  if (status === 401) {
    storage.removeToken();
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      window.location.href = '/login';
    }
  }
}

export const api = async (endpoint, options = {}) => {
  const headers = buildHeaders(options.headers);
  const { headers: _omit, ...rest } = options;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthError(response.status);
    throw new ApiError(data.message || 'Request failed', response.status);
  }

  return data;
};
