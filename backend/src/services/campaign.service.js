import DonationCampaign from "../models/DonationCampaign.js";
import Donation from "../models/Donation.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { AUDIT_ACTIONS } from "../constants/finance.js";
import { sanitizeString, parseAmount, calculateProgress } from "../utils/financeHelpers.js";
import { logAudit } from "./auditLog.service.js";

export const formatCampaign = (campaign) => ({
  id: campaign._id,
  title: campaign.title,
  description: campaign.description,
  image: campaign.image,
  goalAmount: campaign.goalAmount,
  currentAmount: campaign.currentAmount,
  currency: campaign.currency,
  active: campaign.active,
  featured: campaign.featured,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  createdBy: campaign.createdBy,
  progress: calculateProgress(campaign.currentAmount, campaign.goalAmount),
  createdAt: campaign.createdAt,
  updatedAt: campaign.updatedAt,
});

export const createCampaign = async (user, data, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to create campaigns");
  }

  const campaign = await DonationCampaign.create({
    title: sanitizeString(data.title),
    description: sanitizeString(data.description),
    image: sanitizeString(data.image),
    goalAmount: parseAmount(data.goalAmount),
    currency: sanitizeString(data.currency, "ETB"),
    active: data.active !== undefined ? Boolean(data.active) : true,
    featured: Boolean(data.featured),
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
    endDate: data.endDate ? new Date(data.endDate) : null,
    createdBy: user._id,
  });

  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Create", module: "Campaign", targetCollection: "DonationCampaign", targetId: campaign._id, description: `Campaign "${campaign.title}" created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "campaign_created", module: "Campaign", description: `Campaign "${campaign.title}" created`, targetId: campaign._id, targetModel: "DonationCampaign" })).catch(() => {});

  await logAudit({
    user,
    action: AUDIT_ACTIONS.CAMPAIGN_CREATED,
    entityType: "DonationCampaign",
    entityId: campaign._id,
    ip: reqMeta.ip,
  });

  import("../services/autoNotification.service.js").then(m => m.notifyCampaignCreated(campaign, user)).catch(() => {});

  return formatCampaign(campaign);
};

export const listCampaigns = async (filters = {}) => {
  const query = { isDeleted: { $ne: true } };
  if (filters.active !== undefined) query.active = filters.active === "true";
  if (filters.featured !== undefined) query.featured = filters.featured === "true";

  const campaigns = await DonationCampaign.find(query).sort({
    featured: -1,
    createdAt: -1,
  });
  return campaigns.map(formatCampaign);
};

export const getCampaignById = async (campaignId) => {
  const campaign = await DonationCampaign.findOne({
    _id: campaignId,
    isDeleted: { $ne: true },
  });
  if (!campaign) throw new ApiError(404, "Campaign not found");
  return formatCampaign(campaign);
};

export const updateCampaign = async (user, campaignId, data, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to update campaigns");
  }

  const campaign = await DonationCampaign.findOne({
    _id: campaignId,
    isDeleted: { $ne: true },
  });
  if (!campaign) throw new ApiError(404, "Campaign not found");

  const fields = [
    "title",
    "description",
    "image",
    "goalAmount",
    "currency",
    "active",
    "featured",
    "startDate",
    "endDate",
  ];
  for (const field of fields) {
    if (data[field] !== undefined) {
      campaign[field] =
        field === "goalAmount" ? parseAmount(data[field]) : data[field];
    }
  }

  await campaign.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.CAMPAIGN_UPDATED,
    entityType: "DonationCampaign",
    entityId: campaign._id,
    metadata: data,
    ip: reqMeta.ip,
  });

  return formatCampaign(campaign);
};

export const closeCampaign = async (user, campaignId, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to close campaigns");
  }

  const campaign = await DonationCampaign.findOne({
    _id: campaignId,
    isDeleted: { $ne: true },
  });
  if (!campaign) throw new ApiError(404, "Campaign not found");

  campaign.active = false;
  campaign.endDate = new Date();
  await campaign.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.CAMPAIGN_CLOSED,
    entityType: "DonationCampaign",
    entityId: campaign._id,
    ip: reqMeta.ip,
  });

  return formatCampaign(campaign);
};

export const deleteCampaign = async (user, campaignId, reqMeta = {}) => {
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can delete campaigns");
  }

  const campaign = await DonationCampaign.findById(campaignId);
  if (!campaign || campaign.isDeleted) throw new ApiError(404, "Campaign not found");

  campaign.isDeleted = true;
  campaign.deletedAt = new Date();
  campaign.active = false;
  await campaign.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.CAMPAIGN_DELETED,
    entityType: "DonationCampaign",
    entityId: campaign._id,
    ip: reqMeta.ip,
  });

  return { success: true };
};

export const getCampaignAnalytics = async (user, campaignId) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view campaign analytics");
  }

  const campaign = await getCampaignById(campaignId);
  const donations = await Donation.find({
    campaignId,
    paymentStatus: "Paid",
    isDeleted: { $ne: true },
  });

  const donorCount = new Set(
    donations.filter((d) => !d.anonymous).map((d) => d.donorEmail || d.donorName),
  ).size;

  return {
    campaign,
    totalRaised: donations.reduce((s, d) => s + d.amount, 0),
    donationCount: donations.length,
    uniqueDonors: donorCount,
    averageDonation: donations.length
      ? Math.round(
          donations.reduce((s, d) => s + d.amount, 0) / donations.length,
        )
      : 0,
    largestDonation: donations.length
      ? Math.max(...donations.map((d) => d.amount))
      : 0,
  };
};

export const getCampaignProgress = async (campaignId) => {
  const campaign = await getCampaignById(campaignId);
  return {
    id: campaign.id,
    title: campaign.title,
    goalAmount: campaign.goalAmount,
    currentAmount: campaign.currentAmount,
    currency: campaign.currency,
    progress: campaign.progress,
    active: campaign.active,
  };
};
