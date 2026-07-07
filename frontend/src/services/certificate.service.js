import { api } from './api.js';
import { storage } from '../utils/storage.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchProtected(endpoint) {
  const token = storage.getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  return res.text();
}

export const certificateService = {
  getMyCertificates: () => api('/api/my-certificates'),

  getCertificateById: (id) => api(`/api/certificates/${id}`),

  verifyCertificate: (verificationCode) =>
    api(`/api/certificates/verify/${verificationCode}`),

  getStats: () => api('/api/certificates/stats'),

  getPreview: (id) => fetchProtected(`/api/certificates/${id}/preview`),

  requestDownload: (id) =>
    api(`/api/certificates/${id}/download-request`, { method: 'POST' }),

  getDownloadRequests: () => api('/api/certificates/download-requests'),

  reviewDownloadRequest: (id, action) =>
    api(`/api/certificates/download-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  downloadCertificate: async (id) => {
    const token = storage.getToken();
    const res = await fetch(`${API_BASE}/api/certificates/${id}/download`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Download failed');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};