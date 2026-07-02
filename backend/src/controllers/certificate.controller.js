import * as certificateService from "../services/certificate.service.js";

export const getMyCertificates = async (req, res) => {
  const certificates = await certificateService.getCertificates(req.user);
  res.status(200).json({ success: true, data: { certificates } });
};

export const getCertificateById = async (req, res) => {
  const certificate = await certificateService.getCertificateById(
    req.user,
    req.params.id,
  );
  res.status(200).json({ success: true, data: { certificate } });
};

export const verifyCertificate = async (req, res) => {
  const certificate = await certificateService.verifyCertificate(
    req.params.verificationCode,
  );
  res.status(200).json({ success: true, data: { certificate } });
};

export const getCertificateStats = async (req, res) => {
  const stats = await certificateService.getCertificateStats(req.user);
  res.status(200).json({ success: true, data: { stats } });
};
