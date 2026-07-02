import { api } from './api.js';

export const certificateService = {
  getMyCertificates: () => api('/api/my-certificates'),

  getCertificateById: (id) => api(`/api/certificates/${id}`),

  verifyCertificate: (verificationCode) =>
    api(`/api/certificates/verify/${verificationCode}`),

  getStats: () => api('/api/certificates/stats'),
};
