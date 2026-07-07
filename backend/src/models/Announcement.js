import mongoose from "mongoose";
import { ALL_ROLES } from "../constants/roles.js";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRoles: {
      type: [String],
      enum: ALL_ROLES,
      default: ALL_ROLES,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expireDate: {
      type: Date,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

announcementSchema.index({ isActive: 1, publishDate: -1 });
announcementSchema.index({ targetRoles: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
