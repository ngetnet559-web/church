import mongoose from "mongoose";
import { AUDIT_MODULES, AUDIT_ACTIONS } from "../constants/audit.js";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    role: { type: String, default: "" },
    action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true },
    module: { type: String, enum: Object.values(AUDIT_MODULES), required: true },
    targetCollection: { type: String, default: "" },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, default: "" },
    oldValues: { type: mongoose.Schema.Types.Mixed, default: {} },
    newValues: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    browser: { type: String, default: "" },
    operatingSystem: { type: String, default: "" },
    device: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    success: { type: Boolean, default: true },
    statusCode: { type: Number, default: 200 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ role: 1, createdAt: -1 });
auditLogSchema.index({ targetCollection: 1, targetId: 1 });
auditLogSchema.index({ success: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
