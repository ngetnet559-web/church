import mongoose from "mongoose";
import {
  ALL_NOTIFICATION_TYPES,
  ALL_NOTIFICATION_CATEGORIES,
  ALL_NOTIFICATION_PRIORITIES,
} from "../constants/notifications.js";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ALL_NOTIFICATION_TYPES,
      default: "info",
    },
    category: {
      type: String,
      enum: ALL_NOTIFICATION_CATEGORIES,
      default: "System",
    },
    priority: {
      type: String,
      enum: ALL_NOTIFICATION_PRIORITIES,
      default: "normal",
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1 });
notificationSchema.index({ recipient: 1, priority: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
