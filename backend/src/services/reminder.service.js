import EventReminder from "../models/EventReminder.js";
import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";

const createReminders = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) return;

  const registrations = await EventRegistration.find({ event: eventId, status: { $in: ["going", "maybe"] } }).populate("user", "_id");

  const reminderTimes = [
    { label: "24h", offset: 24 * 60 * 60 * 1000 },
    { label: "1h", offset: 60 * 60 * 1000 },
    { label: "15min", offset: 15 * 60 * 1000 },
  ];

  const reminders = [];

  for (const reg of registrations) {
    for (const rt of reminderTimes) {
      const reminderDate = new Date(event.startDate.getTime() - rt.offset);
      if (reminderDate > new Date()) {
        reminders.push({
          event: eventId,
          user: reg.user._id,
          reminderDate,
          sent: false,
        });
      }
    }
  }

  if (reminders.length > 0) {
    await EventReminder.insertMany(reminders);
  }
};

const processReminders = async () => {
  const now = new Date();

  const due = await EventReminder.find({
    reminderDate: { $lte: now },
    sent: false,
  }).populate("event", "title startDate");

  for (const reminder of due) {
    try {
      const { createNotification } = await import("./notification.service.js");
      await createNotification({
        recipient: reminder.user,
        title: "Event Reminder",
        message: `"${reminder.event?.title || "Event"}" starts at ${new Date(reminder.event?.startDate).toLocaleTimeString()}.`,
        type: "info",
        category: "Event",
        priority: "high",
        icon: "bell",
        color: "#6366f1",
        link: `/dashboard/events/${reminder.event?._id}`,
      });

      reminder.sent = true;
      reminder.sentAt = now;
      await reminder.save();
    } catch {
      // silent
    }
  }

  return due.length;
};

const cleanupExpired = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await EventReminder.deleteMany({
    reminderDate: { $lt: thirtyDaysAgo },
  });

  return result.deletedCount;
};

export { createReminders, processReminders, cleanupExpired };
