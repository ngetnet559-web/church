import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";

const createOrUpdateRSVP = async (eventId, userId, status) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  if (event.isCancelled || event.status === "cancelled") {
    throw new ApiError(400, "Cannot RSVP to a cancelled event");
  }

  const existing = await EventRegistration.findOne({ event: eventId, user: userId });

  if (existing) {
    existing.status = status;
    await existing.save();
    return existing;
  }

  if (event.capacity > 0) {
    const count = await EventRegistration.countDocuments({ event: eventId, status: { $in: ["going", "maybe"] } });
    if (count >= event.capacity && status !== "not-going") {
      status = "waiting";
    }
  }

  const registration = await EventRegistration.create({ event: eventId, user: userId, status });

  try {
    const { createNotification } = await import("./notification.service.js");
    await createNotification({
      recipient: event.createdBy,
      title: "New RSVP",
      message: `A user has RSVP'd "${status}" to "${event.title}".`,
      type: "info",
      category: "Event",
      icon: "calendar-check",
      color: "#6366f1",
      link: `/dashboard/events/${eventId}`,
    });
  } catch {
    // silent
  }

  return registration;
};

const getRegistrations = async (eventId) => {
  const registrations = await EventRegistration.find({ event: eventId })
    .populate("user", "name email")
    .sort({ registeredAt: -1 })
    .lean();

  const stats = {
    going: registrations.filter((r) => r.status === "going").length,
    maybe: registrations.filter((r) => r.status === "maybe").length,
    "not-going": registrations.filter((r) => r.status === "not-going").length,
    waiting: registrations.filter((r) => r.status === "waiting").length,
    total: registrations.length,
  };

  return { registrations, stats };
};

const getUserRegistrations = async (userId) => {
  const registrations = await EventRegistration.find({ user: userId })
    .populate({
      path: "event",
      populate: { path: "category", select: "name color icon" },
    })
    .sort({ registeredAt: -1 })
    .lean();

  return registrations;
};

export { createOrUpdateRSVP, getRegistrations, getUserRegistrations };
