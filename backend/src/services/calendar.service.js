import Event from "../models/Event.js";

const getCalendarEvents = async ({ startDate, endDate, userId, targetRole }) => {
  const filter = {
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
    isCancelled: { $ne: true },
    status: "published",
  };

  if (targetRole) {
    filter.$or = [{ targetRoles: targetRole }, { targetRoles: { $exists: false } }, { targetRoles: [] }];
  }

  const events = await Event.find(filter)
    .populate("category", "name color icon")
    .populate("room", "name building")
    .lean();

  return events.map((event) => ({
    id: event._id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.allDay,
    backgroundColor: event.color || "#6366f1",
    borderColor: event.color || "#6366f1",
    textColor: "#ffffff",
    extendedProps: {
      description: event.description,
      location: event.location,
      category: event.category,
      room: event.room,
      status: event.status,
      isCancelled: event.isCancelled,
      speaker: event.speaker,
      organizer: event.organizer,
      capacity: event.capacity,
      recurrence: event.recurrence,
    },
  }));
};

const getMyEvents = async (userId) => {
  const events = await Event.find({
    $or: [{ createdBy: userId }, { "targetRoles": { $in: [] } }],
  })
    .sort({ startDate: -1 })
    .populate("category", "name color icon")
    .lean();

  return events;
};

export { getCalendarEvents, getMyEvents };
