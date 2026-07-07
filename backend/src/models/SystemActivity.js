import mongoose from "mongoose";
import { ACTIVITY_TYPES } from "../constants/audit.js";

const systemActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    activityType: { type: String, enum: Object.values(ACTIVITY_TYPES), required: true },
    module: { type: String, required: true },
    description: { type: String, default: "" },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    targetModel: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

systemActivitySchema.index({ createdAt: -1 });
systemActivitySchema.index({ user: 1, createdAt: -1 });
systemActivitySchema.index({ activityType: 1, createdAt: -1 });
systemActivitySchema.index({ module: 1, createdAt: -1 });

const SystemActivity = mongoose.model("SystemActivity", systemActivitySchema);
export default SystemActivity;
