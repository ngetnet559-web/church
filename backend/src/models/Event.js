import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategory",
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    speaker: {
      type: String,
      default: "",
    },
    organizer: {
      type: String,
      default: "",
    },
    targetRoles: [
      {
        type: String,
      },
    ],
    capacity: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "roles"],
      default: "public",
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly", "yearly"],
      default: "none",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ targetRoles: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
