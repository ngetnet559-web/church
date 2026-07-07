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

export const getCertificatePreview = async (req, res) => {
  const preview = await certificateService.getCertificatePreview(
    req.user,
    req.params.id,
  );
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", "inline");
  res.send(preview.svg);
};

export const requestDownload = async (req, res) => {
  const result = await certificateService.requestDownload(
    req.user,
    req.params.id,
  );
  res.status(201).json({ success: true, data: result });
};

export const getDownloadRequests = async (req, res) => {
  const requests = await certificateService.getDownloadRequests(req.user);
  res.status(200).json({ success: true, data: { requests } });
};

export const reviewDownloadRequest = async (req, res) => {
  const { action } = req.body;
  const result = await certificateService.reviewDownloadRequest(
    req.user,
    req.params.id,
    action,
  );
  res.status(200).json({ success: true, data: result });
};

export const downloadCertificate = async (req, res) => {
  const result = await certificateService.downloadCertificate(
    req.user,
    req.params.id,
  );
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.svg);
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