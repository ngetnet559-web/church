import mongoose from "mongoose";

const eventReminderSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

eventReminderSchema.index({ reminderDate: 1, sent: 1 });
eventReminderSchema.index({ event: 1, user: 1 });

const EventReminder = mongoose.model("EventReminder", eventReminderSchema);

export default EventReminder;
