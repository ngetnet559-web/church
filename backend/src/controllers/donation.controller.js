import * as donationService from "../services/donation.service.js";
import * as auditLogService from "../services/auditLog.service.js";

const reqMeta = (req) => ({ ip: req.ip || req.headers["x-forwarded-for"] || "" });

export const createDonation = async (req, res) => {
  const result = await donationService.createDonation(req.user, req.body, reqMeta(req));
  res.status(201).json({ success: true, data: result });
};

export const listDonations = async (req, res) => {
  const donations = await donationService.listDonations(req.user, req.query);
  res.status(200).json({ success: true, data: { donations } });
};

export const getMyDonations = async (req, res) => {
  const donations = await donationService.getMyDonations(req.user);
  res.status(200).json({ success: true, data: { donations } });
};

export const getDonationStatistics = async (req, res) => {
  const statistics = await donationService.getDonationStatistics(req.user);
  res.status(200).json({ success: true, data: { statistics } });
};

export const getDonationById = async (req, res) => {
  const donation = await donationService.getDonationById(req.user, req.params.id);
  res.status(200).json({ success: true, data: { donation } });
};

export const updateDonation = async (req, res) => {
  const donation = await donationService.updateDonation(
    req.user,
    req.params.id,
    req.body,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { donation } });
};

export const deleteDonation = async (req, res) => {
  const result = await donationService.deleteDonation(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: result });
};

export const restoreDonation = async (req, res) => {
  const donation = await donationService.restoreDonation(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { donation } });
};

export const refundDonation = async (req, res) => {
  const donation = await donationService.refundDonation(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { donation } });
};

export const approveOfflineDonation = async (req, res) => {
  const donation = await donationService.approveOfflineDonation(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { donation } });
};

export const generateReceipt = async (req, res) => {
  const receipt = await donationService.generateReceipt(req.user, req.params.id);
  if (req.query.format === "html") {
    res.setHeader("Content-Type", "text/html");
    return res.send(receipt.html);
  }
  res.status(200).json({ success: true, data: { receipt } });
};

export const listAuditLogs = async (req, res) => {
  const logs = await auditLogService.listAuditLogs(req.user, req.query);
  res.status(200).json({ success: true, data: { logs } });
};
