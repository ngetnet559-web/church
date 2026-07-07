import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import EventReminder from "../models/EventReminder.js";
import RoomBooking from "../models/RoomBooking.js";
import { createNotification } from "./notification.service.js";
import notificationEmitter from "./notificationEventEmitter.js";

const getEvents = async ({ page = 1, limit = 20, search, category, status, startDate, endDate, visibility, targetRole, upcoming }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (visibility) filter.visibility = visibility;
  if (targetRole) filter.targetRoles = targetRole;

  if (upcoming) {
    filter.startDate = { $gte: new Date() };
    filter.status = "published";
    filter.isCancelled = { $ne: true };
  } else if (startDate || endDate) {
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { ...filter.endDate, $lte: new Date(endDate) };
  }

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name color icon")
      .populate("createdBy", "name email")
      .populate("room", "name building")
      .lean(),
    Event.countDocuments(filter),
  ]);

  const eventIds = events.map((e) => e._id);
  const registrations = await EventRegistration.aggregate([
    { $match: { event: { $in: eventIds } } },
    { $group: { _id: { event: "$event", status: "$status" }, count: { $sum: 1 } } },
  ]);

  const regMap = {};
  registrations.forEach((r) => {
    const eId = r._id.event.toString();
    if (!regMap[eId]) regMap[eId] = {};
    regMap[eId][r._id.status] = r.count;
  });

  const enriched = events.map((event) => ({
    ...event,
    registrationCounts: regMap[event._id.toString()] || { going: 0, maybe: 0, "not-going": 0, waiting: 0 },
  }));

  return { events: enriched, total, page, totalPages: Math.ceil(total / limit) };
};

const getEventById = async (id) => {
  const event = await Event.findById(id)
    .populate("category", "name color icon")
    .populate("createdBy", "name email")
    .populate("room", "name building capacity")
    .lean();

  if (!event) return null;

  const registrations = await EventRegistration.find({ event: id })
    .populate("user", "name email")
    .lean();

  return { ...event, registrations };
};

const createEvent = async (data, userId) => {
  const event = await Event.create({ ...data, createdBy: userId });
  const populated = await Event.findById(event._id)
    .populate("category", "name color icon")
    .populate("createdBy", "name email")
    .lean();

  if (data.room) {
    await RoomBooking.create({
      room: data.room,
      event: event._id,
      bookedBy: userId,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "approved",
    });
  }

  try {
    const { notifyEventCreated } = await import("./autoNotificationCalendar.service.js");
    await notifyEventCreated(populated, userId);
  } catch {
    // silent
  }

  import("../services/audit.service.js").then(m => m.logAudit({ user: userId ? { _id: userId } : null, action: "Create", module: "Event", targetCollection: "Event", targetId: populated._id, description: `Event "${populated.title}" created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user: userId ? { _id: userId } : null, activityType: "event_created", module: "Event", description: `Event "${populated.title}" created`, targetId: populated._id, targetModel: "Event" })).catch(() => {});
  return populated;
};

const updateEvent = async (id, data) => {
  const event = await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("category", "name color icon")
    .populate("createdBy", "name email")
    .lean();

  if (event) {
    try {
      const { notifyEventUpdated } = await import("./autoNotificationCalendar.service.js");
      await notifyEventUpdated(event);
    } catch {
      // silent
    }
  }

  import("../services/audit.service.js").then(m => m.logAudit({ action: "Update", module: "Event", targetCollection: "Event", targetId: id, description: event ? `Event "${event.title}" updated` : "Event updated" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "event_updated", module: "Event", description: event ? `Event "${event.title}" updated` : "Event updated", targetId: id, targetModel: "Event" })).catch(() => {});
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findById(id).lean();
  await EventRegistration.deleteMany({ event: id });
  await EventReminder.deleteMany({ event: id });
  await RoomBooking.deleteMany({ event: id });
  await Event.findByIdAndDelete(id);
  import("../services/audit.service.js").then(m => m.logAudit({ action: "Delete", module: "Event", targetCollection: "Event", targetId: id, description: event ? `Event "${event.title}" deleted` : "Event deleted" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "event_deleted", module: "Event", description: event ? `Event "${event.title}" deleted` : "Event deleted", targetId: id, targetModel: "Event" })).catch(() => {});
  return { message: "Event deleted successfully" };
};

const cancelEvent = async (id, reason) => {
  const event = await Event.findByIdAndUpdate(id, { isCancelled: true, cancelReason: reason, status: "cancelled" }, { new: true });

  if (event) {
    try {
      const { notifyEventCancelled } = await import("./autoNotificationCalendar.service.js");
      await notifyEventCancelled(event);
    } catch {
      // silent
    }
  }

  import("../services/audit.service.js").then(m => m.logAudit({ action: "Update", module: "Event", targetCollection: "Event", targetId: id, description: event ? `Event "${event.title}" cancelled` : "Event cancelled" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "event_cancelled", module: "Event", description: event ? `Event "${event.title}" cancelled` : "Event cancelled", targetId: id, targetModel: "Event" })).catch(() => {});
  return event;
};

const duplicateEvent = async (id) => {
  const original = await Event.findById(id).lean();
  if (!original) return null;

  const newEvent = await Event.create({
    title: `${original.title} (Copy)`,
    description: original.description,
    category: original.category,
    startDate: original.startDate,
    endDate: original.endDate,
    allDay: original.allDay,
    location: original.location,
    room: original.room,
    createdBy: original.createdBy,
    speaker: original.speaker,
    organizer: original.organizer,
    targetRoles: original.targetRoles,
    capacity: original.capacity,
    visibility: original.visibility,
    color: original.color,
    recurrence: original.recurrence,
  });

  return Event.findById(newEvent._id)
    .populate("category", "name color icon")
    .populate("createdBy", "name email")
    .lean();
};

const getUpcomingEvents = async (limit = 5) => {
  const events = await Event.find({
    startDate: { $gte: new Date() },
    status: "published",
    isCancelled: { $ne: true },
  })
    .sort({ startDate: 1 })
    .limit(limit)
    .populate("category", "name color icon")
    .lean();

  return events;
};

const getTodaysEvents = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const events = await Event.find({
    startDate: { $lte: end },
    endDate: { $gte: start },
    status: "published",
    isCancelled: { $ne: true },
  })
    .sort({ startDate: 1 })
    .populate("category", "name color icon")
    .lean();

  return events;
};

export {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  duplicateEvent,
  getUpcomingEvents,
  getTodaysEvents,
};
