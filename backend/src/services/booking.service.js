import RoomBooking from "../models/RoomBooking.js";
import Room from "../models/Room.js";
import { ApiError } from "../utils/ApiError.js";

const checkOverlap = async (roomId, startDate, endDate, excludeId = null) => {
  const filter = {
    room: roomId,
    status: { $in: ["approved", "pending"] },
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
    ],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const overlapping = await RoomBooking.findOne(filter).lean();
  return !!overlapping;
};

const createBooking = async (data, userId) => {
  const room = await Room.findById(data.room);
  if (!room) throw new ApiError(404, "Room not found");
  if (!room.isAvailable) throw new ApiError(400, "Room is not available");

  const hasOverlap = await checkOverlap(data.room, data.startDate, data.endDate);
  if (hasOverlap) throw new ApiError(409, "This time slot overlaps with an existing booking");

  const booking = await RoomBooking.create({ ...data, bookedBy: userId });
  const result = await RoomBooking.findById(booking._id)
    .populate("room", "name building")
    .populate("bookedBy", "name email")
    .lean();
  import("../services/audit.service.js").then(m => m.logAudit({ user: userId ? { _id: userId } : null, action: "Create", module: "Room Booking", targetCollection: "RoomBooking", targetId: booking._id, description: `Room booking created for "${result?.room?.name || data.room}"` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user: userId ? { _id: userId } : null, activityType: "booking_created", module: "Room Booking", description: "Room booking created", targetId: booking._id, targetModel: "RoomBooking" })).catch(() => {});
  return result;
};

const getBookings = async ({ page = 1, limit = 20, roomId, userId, status, date }) => {
  const filter = {};
  if (roomId) filter.room = roomId;
  if (userId) filter.bookedBy = userId;
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    filter.$or = [
      { startDate: { $gte: start, $lte: end } },
      { endDate: { $gte: start, $lte: end } },
    ];
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    RoomBooking.find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("room", "name building capacity")
      .populate("bookedBy", "name email")
      .lean(),
    RoomBooking.countDocuments(filter),
  ]);

  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
};

const updateBooking = async (id, data, userId) => {
  const booking = await RoomBooking.findById(id);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (data.startDate || data.endDate) {
    const hasOverlap = await checkOverlap(
      data.room || booking.room,
      data.startDate || booking.startDate,
      data.endDate || booking.endDate,
      id
    );
    if (hasOverlap) throw new ApiError(409, "Updated time slot overlaps with an existing booking");
  }

  const updated = await RoomBooking.findByIdAndUpdate(id, data, { new: true })
    .populate("room", "name building")
    .populate("bookedBy", "name email")
    .lean();

  import("../services/audit.service.js").then(m => m.logAudit({ user: userId ? { _id: userId } : null, action: "Update", module: "Room Booking", targetCollection: "RoomBooking", targetId: id, description: "Room booking updated" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ user: userId ? { _id: userId } : null, activityType: "booking_updated", module: "Room Booking", description: "Room booking updated", targetId: id, targetModel: "RoomBooking" })).catch(() => {});
  return updated;
};

const deleteBooking = async (id) => {
  const booking = await RoomBooking.findByIdAndDelete(id);
  if (booking) {
    import("../services/audit.service.js").then(m => m.logAudit({ action: "Delete", module: "Room Booking", targetCollection: "RoomBooking", targetId: id, description: "Room booking deleted" })).catch(() => {});
    import("../services/activity.service.js").then(m => m.logActivity({ activityType: "booking_deleted", module: "Room Booking", description: "Room booking deleted", targetId: id, targetModel: "RoomBooking" })).catch(() => {});
  }
  return booking;
};

const approveBooking = async (id) => {
  const booking = await RoomBooking.findByIdAndUpdate(id, { status: "approved" }, { new: true })
    .populate("room", "name building")
    .populate("bookedBy", "name email")
    .lean();

  if (booking) {
    try {
      const { createNotification } = await import("./notification.service.js");
      await createNotification({
        recipient: booking.bookedBy._id || booking.bookedBy,
        title: "Booking Approved",
        message: `Your booking for "${booking.title || booking.room?.name}" has been approved.`,
        type: "success",
        category: "Event",
        icon: "check-circle",
        color: "#22c55e",
        link: "/dashboard/rooms",
      });
    } catch {
      // silent
    }
  }

  import("../services/audit.service.js").then(m => m.logAudit({ action: "Approve", module: "Room Booking", targetCollection: "RoomBooking", targetId: id, description: booking ? `Room booking approved for "${booking.title || booking.room?.name}"` : "Room booking approved" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "booking_approved", module: "Room Booking", description: "Room booking approved", targetId: id, targetModel: "RoomBooking" })).catch(() => {});
  return booking;
};

const rejectBooking = async (id, reason) => {
  const booking = await RoomBooking.findByIdAndUpdate(id, { status: "rejected", notes: reason || "Booking rejected" }, { new: true })
    .populate("room", "name building")
    .populate("bookedBy", "name email")
    .lean();

  if (booking) {
    try {
      const { createNotification } = await import("./notification.service.js");
      await createNotification({
        recipient: booking.bookedBy._id || booking.bookedBy,
        title: "Booking Rejected",
        message: `Your booking for "${booking.title || booking.room?.name}" was rejected.${reason ? ` Reason: ${reason}` : ""}`,
        type: "error",
        category: "Event",
        icon: "x-circle",
        color: "#ef4444",
        link: "/dashboard/rooms",
      });
    } catch {
      // silent
    }
  }

  import("../services/audit.service.js").then(m => m.logAudit({ action: "Reject", module: "Room Booking", targetCollection: "RoomBooking", targetId: id, description: booking ? `Room booking rejected for "${booking.title || booking.room?.name}"` : "Room booking rejected" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "booking_rejected", module: "Room Booking", description: "Room booking rejected", targetId: id, targetModel: "RoomBooking" })).catch(() => {});
  return booking;
};

export { createBooking, getBookings, updateBooking, deleteBooking, approveBooking, rejectBooking, checkOverlap };
