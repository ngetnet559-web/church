import mongoose from "mongoose";

const certificateDownloadRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const CertificateDownloadRequest = mongoose.model(
  "CertificateDownloadRequest",
  certificateDownloadRequestSchema,
);

export default CertificateDownloadRequest;