import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    browser: { type: String, default: "" },
    operatingSystem: { type: String, default: "" },
    device: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    success: { type: Boolean, default: true },
    failureReason: { type: String, default: "" },
    sessionDuration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

loginHistorySchema.index({ user: 1, loginTime: -1 });
loginHistorySchema.index({ loginTime: -1 });
loginHistorySchema.index({ success: 1, loginTime: -1 });
loginHistorySchema.index({ ipAddress: 1 });

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
export default LoginHistory;
