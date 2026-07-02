import * as campaignService from "../services/campaign.service.js";

const reqMeta = (req) => ({ ip: req.ip || req.headers["x-forwarded-for"] || "" });

export const createCampaign = async (req, res) => {
  const campaign = await campaignService.createCampaign(req.user, req.body, reqMeta(req));
  res.status(201).json({ success: true, data: { campaign } });
};

export const listCampaigns = async (req, res) => {
  const campaigns = await campaignService.listCampaigns(req.query);
  res.status(200).json({ success: true, data: { campaigns } });
};

export const getCampaignById = async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id);
  res.status(200).json({ success: true, data: { campaign } });
};

export const updateCampaign = async (req, res) => {
  const campaign = await campaignService.updateCampaign(
    req.user,
    req.params.id,
    req.body,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { campaign } });
};

export const closeCampaign = async (req, res) => {
  const campaign = await campaignService.closeCampaign(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: { campaign } });
};

export const deleteCampaign = async (req, res) => {
  const result = await campaignService.deleteCampaign(
    req.user,
    req.params.id,
    reqMeta(req),
  );
  res.status(200).json({ success: true, data: result });
};

export const getCampaignAnalytics = async (req, res) => {
  const analytics = await campaignService.getCampaignAnalytics(
    req.user,
    req.params.id,
  );
  res.status(200).json({ success: true, data: { analytics } });
};

export const getCampaignProgress = async (req, res) => {
  const progress = await campaignService.getCampaignProgress(req.params.id);
  res.status(200).json({ success: true, data: { progress } });
};
