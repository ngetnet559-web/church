import Donation from "../models/Donation.js";
import DonationCampaign from "../models/DonationCampaign.js";
import Budget from "../models/Budget.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import {
  DONATION_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  AUDIT_ACTIONS,
} from "../constants/finance.js";
import {
  sanitizeString,
  parseAmount,
  buildDateRangeQuery,
  getStartOfDay,
  getStartOfMonth,
  getStartOfYear,
  requireUniqueReference,
} from "../utils/financeHelpers.js";
import {
  generateReceiptHtml,
  generateReceiptUrl,
} from "../utils/receiptGenerator.js";
import { getPaymentProvider, isOnlinePaymentMethod } from "./payment/index.js";
import { logAudit } from "./auditLog.service.js";

export const formatDonation = (donation) => ({
  id: donation._id,
  donorName: donation.anonymous ? "Anonymous" : donation.donorName,
  donorEmail: donation.anonymous ? "" : donation.donorEmail,
  donorPhone: donation.anonymous ? "" : donation.donorPhone,
  memberId: donation.memberId,
  amount: donation.amount,
  currency: donation.currency,
  paymentMethod: donation.paymentMethod,
  paymentStatus: donation.paymentStatus,
  transactionReference: donation.transactionReference,
  donationType: donation.donationType,
  campaignId: donation.campaignId,
  campaign: donation.campaignId?.title
    ? { id: donation.campaignId._id, title: donation.campaignId.title }
    : undefined,
  anonymous: donation.anonymous,
  message: donation.message,
  receiptNumber: donation.receiptNumber,
  receiptUrl: donation.receiptUrl,
  donatedAt: donation.donatedAt,
  createdBy: donation.createdBy,
  createdAt: donation.createdAt,
  updatedAt: donation.updatedAt,
});

const buildDonationQuery = (filters = {}) => {
  const query = { isDeleted: { $ne: true } };

  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.donationType) query.donationType = filters.donationType;
  if (filters.campaignId) query.campaignId = filters.campaignId;
  if (filters.anonymous !== undefined) query.anonymous = filters.anonymous === "true";
  if (filters.donor) {
    query.$or = [
      { donorName: { $regex: filters.donor, $options: "i" } },
      { donorEmail: { $regex: filters.donor, $options: "i" } },
    ];
  }
  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = Number(filters.minAmount);
    if (filters.maxAmount) query.amount.$lte = Number(filters.maxAmount);
  }
  Object.assign(query, buildDateRangeQuery(filters.startDate, filters.endDate));

  return query;
};

const validateDonationInput = (data) => {
  if (!data.donorName && !data.anonymous) {
    throw new ApiError(400, "Donor name is required unless donating anonymously");
  }
  if (!data.amount) throw new ApiError(400, "Amount is required");
  if (data.donationType && !DONATION_TYPES.includes(data.donationType)) {
    throw new ApiError(400, "Invalid donation type");
  }
  if (data.paymentMethod && !PAYMENT_METHODS.includes(data.paymentMethod)) {
    throw new ApiError(400, "Invalid payment method");
  }
  if (data.paymentStatus && !PAYMENT_STATUS.includes(data.paymentStatus)) {
    throw new ApiError(400, "Invalid payment status");
  }
};

const incrementCampaignAmount = async (campaignId, amount) => {
  if (!campaignId) return;
  await DonationCampaign.findByIdAndUpdate(campaignId, {
    $inc: { currentAmount: amount },
  });
};

export const createDonation = async (user, data, reqMeta = {}) => {
  validateDonationInput(data);

  const amount = parseAmount(data.amount);
  const paymentMethod = data.paymentMethod || "Cash";
  const isOffline = ["Cash", "Bank Transfer", "Other"].includes(paymentMethod);
  const paymentStatus =
    data.paymentStatus || (isOffline ? "Pending" : "Pending");

  const transactionReference = sanitizeString(data.transactionReference);
  await requireUniqueReference(Donation, transactionReference);

  if (data.campaignId) {
    const campaign = await DonationCampaign.findOne({
      _id: data.campaignId,
      isDeleted: { $ne: true },
    });
    if (!campaign) throw new ApiError(404, "Campaign not found");
    if (!campaign.active) throw new ApiError(400, "Campaign is not active");
  }

  const donation = await Donation.create({
    donorName: data.anonymous
      ? "Anonymous"
      : sanitizeString(data.donorName, "Anonymous"),
    donorEmail: sanitizeString(data.donorEmail),
    donorPhone: sanitizeString(data.donorPhone),
    memberId: data.memberId || user?._id || null,
    amount,
    currency: sanitizeString(data.currency, "ETB"),
    paymentMethod,
    paymentStatus,
    transactionReference,
    donationType: data.donationType || "General",
    campaignId: data.campaignId || null,
    anonymous: Boolean(data.anonymous),
    message: sanitizeString(data.message),
    createdBy: user?._id || null,
    donatedAt: data.donatedAt ? new Date(data.donatedAt) : new Date(),
  });

  donation.receiptUrl = generateReceiptUrl(donation._id, donation.receiptNumber);
  await donation.save();

  if (paymentStatus === "Paid") {
    await incrementCampaignAmount(donation.campaignId, amount);
  }

  import("../services/autoNotification.service.js").then(m => m.notifyDonationReceived(donation)).catch(() => {});
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Create", module: "Donation", targetCollection: "Donation", targetId: donation._id, description: `Donation of ${amount} ${donation.currency} created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "donation_created", module: "Donation", description: `Donation of ${amount} created${donation.campaignId ? " for campaign" : ""}`, targetId: donation._id, targetModel: "Donation" })).catch(() => {});

  let payment = null;
  if (isOnlinePaymentMethod(paymentMethod)) {
    const provider = getPaymentProvider(paymentMethod);
    payment = await provider.initializePayment({
      donationId: donation._id,
      amount,
      currency: donation.currency,
      reference: transactionReference || donation.receiptNumber,
    });
  }

  await logAudit({
    user,
    action: AUDIT_ACTIONS.DONATION_CREATED,
    entityType: "Donation",
    entityId: donation._id,
    metadata: { amount, paymentMethod },
    ip: reqMeta.ip,
  });

  return { donation: formatDonation(donation), payment };
};

export const updateDonation = async (user, donationId, data, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to update donations");
  }

  const donation = await Donation.findOne({
    _id: donationId,
    isDeleted: { $ne: true },
  });
  if (!donation) throw new ApiError(404, "Donation not found");

  const previousStatus = donation.paymentStatus;
  const previousAmount = donation.amount;

  if (data.transactionReference) {
    await requireUniqueReference(
      Donation,
      sanitizeString(data.transactionReference),
      donationId,
    );
    donation.transactionReference = sanitizeString(data.transactionReference);
  }

  const allowedFields = [
    "donorName",
    "donorEmail",
    "donorPhone",
    "paymentMethod",
    "paymentStatus",
    "donationType",
    "message",
    "anonymous",
  ];
  for (const field of allowedFields) {
    if (data[field] !== undefined) donation[field] = data[field];
  }

  await donation.save();

  if (previousStatus !== "Paid" && donation.paymentStatus === "Paid") {
    await incrementCampaignAmount(donation.campaignId, donation.amount);
  }
  if (previousStatus === "Paid" && donation.paymentStatus === "Refunded") {
    await incrementCampaignAmount(donation.campaignId, -previousAmount);
  }

  await logAudit({
    user,
    action: AUDIT_ACTIONS.DONATION_UPDATED,
    entityType: "Donation",
    entityId: donation._id,
    metadata: data,
    ip: reqMeta.ip,
  });

  return formatDonation(donation);
};

export const deleteDonation = async (user, donationId, reqMeta = {}) => {
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can delete financial records");
  }

  const donation = await Donation.findById(donationId);
  if (!donation || donation.isDeleted) throw new ApiError(404, "Donation not found");

  donation.isDeleted = true;
  donation.deletedAt = new Date();
  await donation.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.DONATION_DELETED,
    entityType: "Donation",
    entityId: donation._id,
    ip: reqMeta.ip,
  });

  return { success: true };
};

export const restoreDonation = async (user, donationId, reqMeta = {}) => {
  if (user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Only super admins can restore financial records");
  }

  const donation = await Donation.findById(donationId);
  if (!donation || !donation.isDeleted) {
    throw new ApiError(404, "Deleted donation not found");
  }

  donation.isDeleted = false;
  donation.deletedAt = null;
  await donation.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.DONATION_RESTORED,
    entityType: "Donation",
    entityId: donation._id,
    ip: reqMeta.ip,
  });

  return formatDonation(donation);
};

export const refundDonation = async (user, donationId, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to refund donations");
  }

  const donation = await Donation.findOne({
    _id: donationId,
    isDeleted: { $ne: true },
  });
  if (!donation) throw new ApiError(404, "Donation not found");
  if (donation.paymentStatus === "Refunded") {
    throw new ApiError(400, "Donation is already refunded");
  }

  if (isOnlinePaymentMethod(donation.paymentMethod)) {
    const provider = getPaymentProvider(donation.paymentMethod);
    await provider.refundPayment({
      donationId: donation._id,
      amount: donation.amount,
      reference: donation.transactionReference || donation.receiptNumber,
    });
  }

  if (donation.paymentStatus === "Paid" && donation.campaignId) {
    await incrementCampaignAmount(donation.campaignId, -donation.amount);
  }

  donation.paymentStatus = "Refunded";
  await donation.save();

  await logAudit({
    user,
    action: AUDIT_ACTIONS.DONATION_REFUNDED,
    entityType: "Donation",
    entityId: donation._id,
    ip: reqMeta.ip,
  });

  return formatDonation(donation);
};

export const approveOfflineDonation = async (user, donationId, reqMeta = {}) => {
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user.role)) {
    throw new ApiError(403, "You do not have permission to approve donations");
  }

  const donation = await Donation.findOne({
    _id: donationId,
    isDeleted: { $ne: true },
  });
  if (!donation) throw new ApiError(404, "Donation not found");

  if (donation.paymentStatus === "Paid") {
    return formatDonation(donation);
  }

  donation.paymentStatus = "Paid";
  await donation.save();
  await incrementCampaignAmount(donation.campaignId, donation.amount);

  import("../services/autoNotification.service.js").then(m => m.notifyDonationApproved(donation)).catch(() => {});
  import("../services/audit.service.js").then(m => m.logAudit({ user, action: "Approve", module: "Donation", targetCollection: "Donation", targetId: donation._id, description: `Donation of ${donation.amount} approved` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user, activityType: "donation_approved", module: "Donation", description: `Donation of ${donation.amount} approved`, targetId: donation._id, targetModel: "Donation" })).catch(() => {});

  await logAudit({
    user,
    action: AUDIT_ACTIONS.DONATION_UPDATED,
    entityType: "Donation",
    entityId: donation._id,
    metadata: { approved: true },
    ip: reqMeta.ip,
  });

  return formatDonation(donation);
};

export const generateReceipt = async (user, donationId) => {
  const donation = await Donation.findOne({
    _id: donationId,
    isDeleted: { $ne: true },
  });
  if (!donation) throw new ApiError(404, "Donation not found");

  const isOwner =
    user &&
    donation.memberId?.toString() === user._id.toString();
  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role);

  if (user && !isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to view this receipt");
  }

  const html = generateReceiptHtml(donation);
  return {
    receiptNumber: donation.receiptNumber,
    receiptUrl: donation.receiptUrl,
    html,
  };
};

export const listDonations = async (user, filters = {}) => {
  const adminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
  if (!adminRoles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view donations");
  }

  const donations = await Donation.find(buildDonationQuery(filters))
    .populate("campaignId", "title")
    .populate("memberId", "name email")
    .sort({ donatedAt: -1 });

  return donations.map(formatDonation);
};

export const getMyDonations = async (user) => {
  const donations = await Donation.find({
    memberId: user._id,
    isDeleted: { $ne: true },
  })
    .populate("campaignId", "title")
    .sort({ donatedAt: -1 });

  return donations.map(formatDonation);
};

export const getDonationById = async (user, donationId) => {
  const donation = await Donation.findOne({
    _id: donationId,
    isDeleted: { $ne: true },
  }).populate("campaignId", "title");

  if (!donation) throw new ApiError(404, "Donation not found");

  if (user) {
    const isOwner = donation.memberId?.toString() === user._id.toString();
    const isStaff = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER].includes(
      user.role,
    );
    if (!isOwner && !isStaff) {
      throw new ApiError(403, "You do not have permission to view this donation");
    }
  }

  return formatDonation(donation);
};

export const getDonationStatistics = async (user) => {
  const query =
    [ROLES.STUDENT, ROLES.PARENT].includes(user.role)
      ? { memberId: user._id, isDeleted: { $ne: true } }
      : { isDeleted: { $ne: true }, paymentStatus: "Paid" };

  const donations = await Donation.find(query);
  const today = getStartOfDay();
  const monthStart = getStartOfMonth();
  const yearStart = getStartOfYear();

  const paid = donations.filter((d) => d.paymentStatus === "Paid");

  return {
    total: paid.reduce((s, d) => s + d.amount, 0),
    count: paid.length,
    today: paid
      .filter((d) => d.donatedAt >= today)
      .reduce((s, d) => s + d.amount, 0),
    thisMonth: paid
      .filter((d) => d.donatedAt >= monthStart)
      .reduce((s, d) => s + d.amount, 0),
    thisYear: paid
      .filter((d) => d.donatedAt >= yearStart)
      .reduce((s, d) => s + d.amount, 0),
    byType: DONATION_TYPES.reduce((acc, type) => {
      acc[type] = paid
        .filter((d) => d.donationType === type)
        .reduce((s, d) => s + d.amount, 0);
      return acc;
    }, {}),
  };
};

export const syncBudgetFromExpense = async (category, amount) => {
  const budget = await Budget.findOne({
    category,
    isDeleted: { $ne: true },
  });
  if (budget) {
    budget.spentAmount += amount;
    budget.remainingAmount = Math.max(0, budget.allocatedAmount - budget.spentAmount);
    await budget.save();
  }
};
