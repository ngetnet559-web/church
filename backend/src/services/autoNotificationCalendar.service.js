import EventRegistration from "../models/EventRegistration.js";
import { createNotification } from "./notification.service.js";

const notifyEventCreated = async (event, creatorId) => {
  if (!event || event.visibility === "private") return;

  const title = "New Event Created";
  const message = `A new event "${event.title}" has been scheduled.`;

  if (event.targetRoles && event.targetRoles.length > 0) {
    for (const role of event.targetRoles) {
      try {
        await createNotification({
          role,
          title,
          message,
          type: "info",
          category: "Event",
          icon: "calendar-plus",
          color: "#6366f1",
          link: `/dashboard/events/${event._id}`,
        });
      } catch {
        // silent
      }
    }
  }
};

const notifyEventUpdated = async (event) => {
  const registrations = await EventRegistration.find({
    event: event._id,
    status: { $in: ["going", "maybe"] },
  }).populate("user", "_id");

  for (const reg of registrations) {
    try {
      await createNotification({
        recipient: reg.user._id,
        title: "Event Updated",
        message: `"${event.title}" has been updated. Check the details.`,
        type: "info",
        category: "Event",
        icon: "calendar-edit",
        color: "#f59e0b",
        link: `/dashboard/events/${event._id}`,
      });
    } catch {
      // silent
    }
  }
};

const notifyEventCancelled = async (event) => {
  const registrations = await EventRegistration.find({
    event: event._id,
    status: { $in: ["going", "maybe"] },
  }).populate("user", "_id");

  for (const reg of registrations) {
    try {
      await createNotification({
        recipient: reg.user._id,
        title: "Event Cancelled",
        message: `"${event.title}" has been cancelled.${event.cancelReason ? ` Reason: ${event.cancelReason}` : ""}`,
        type: "error",
        category: "Event",
        priority: "high",
        icon: "calendar-off",
        color: "#ef4444",
        link: `/dashboard/events/${event._id}`,
      });
    } catch {
      // silent
    }
  }
};

export { notifyEventCreated, notifyEventUpdated, notifyEventCancelled };
