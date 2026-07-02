import mongoose from "mongoose";
import {
  DONATION_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "../constants/finance.js";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
    },
    donorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    donorPhone: {
      type: String,
      trim: true,
      default: "",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Donation amount must be at least 1"],
    },
    currency: {
      type: String,
      default: "ETB",
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "Other",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "Pending",
    },
    transactionReference: {
      type: String,
      trim: true,
      default: "",
    },
    donationType: {
      type: String,
      enum: DONATION_TYPES,
      default: "General",
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationCampaign",
      default: null,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    donatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

donationSchema.index({ createdBy: 1, paymentStatus: 1, donatedAt: -1 });
donationSchema.index({ campaignId: 1 });
donationSchema.index({ transactionReference: 1 }, { sparse: true });
donationSchema.index({ donorName: "text", donorEmail: "text" });

donationSchema.pre("save", function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  next();
});

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
