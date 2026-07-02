import mongoose from "mongoose";

const donationCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Campaign title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    goalAmount: {
      type: Number,
      required: [true, "Campaign goal amount is required"],
      min: [1, "Goal amount must be at least 1"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "ETB",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

donationCampaignSchema.index({ active: 1, featured: 1, endDate: 1 });

const DonationCampaign = mongoose.model(
  "DonationCampaign",
  donationCampaignSchema,
);

export default DonationCampaign;
