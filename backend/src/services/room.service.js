import Room from "../models/Room.js";
import RoomBooking from "../models/RoomBooking.js";

const getRooms = async ({ page = 1, limit = 50, search, isAvailable, capacity }) => {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { building: { $regex: search, $options: "i" } },
    ];
  }
  if (isAvailable !== undefined) filter.isAvailable = isAvailable;
  if (capacity) filter.capacity = { $gte: parseInt(capacity) };

  const skip = (page - 1) * limit;

  const [rooms, total] = await Promise.all([
    Room.find(filter).sort({ building: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Room.countDocuments(filter),
  ]);

  const roomIds = rooms.map((r) => r._id);
  const now = new Date();
  const activeBookings = await RoomBooking.countDocuments({
    room: { $in: roomIds },
    startDate: { $lte: now },
    endDate: { $gte: now },
    status: { $in: ["approved", "pending"] },
  });

  return { rooms, total, page, totalPages: Math.ceil(total / limit), activeBookings };
};

const getRoomById = async (id) => {
  const room = await Room.findById(id).lean();
  if (!room) return null;

  const upcomingBookings = await RoomBooking.find({
    room: id,
    startDate: { $gte: new Date() },
    status: { $ne: "cancelled" },
  })
    .sort({ startDate: 1 })
    .populate("bookedBy", "name email")
    .lean();

  return { ...room, upcomingBookings };
};

const createRoom = async (data) => {
  const room = await Room.create(data);
  import("../services/audit.service.js").then(m => m.logAudit({ action: "Create", module: "Room", targetCollection: "Room", targetId: room._id, description: `Room "${room.name}" created` })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "room_created", module: "Room", description: `Room "${room.name}" created`, targetId: room._id, targetModel: "Room" })).catch(() => {});
  return room;
};

const updateRoom = async (id, data) => {
  const room = await Room.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (room) {
    import("../services/audit.service.js").then(m => m.logAudit({ action: "Update", module: "Room", targetCollection: "Room", targetId: id, description: `Room "${room.name}" updated` })).catch(() => {});
    import("../services/activity.service.js").then(m => m.logActivity({ activityType: "room_updated", module: "Room", description: `Room "${room.name}" updated`, targetId: id, targetModel: "Room" })).catch(() => {});
  }
  return room;
};

const deleteRoom = async (id) => {
  const room = await Room.findById(id).lean();
  await RoomBooking.deleteMany({ room: id });
  await Room.findByIdAndDelete(id);
  import("../services/audit.service.js").then(m => m.logAudit({ action: "Delete", module: "Room", targetCollection: "Room", targetId: id, description: room ? `Room "${room.name}" deleted` : "Room deleted" })).catch(() => {});
  import("../services/activity.service.js").then(m => m.logActivity({ activityType: "room_deleted", module: "Room", description: room ? `Room "${room.name}" deleted` : "Room deleted", targetId: id, targetModel: "Room" })).catch(() => {});
  return { message: "Room deleted successfully" };
};

const getRoomSchedule = async (roomId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const bookings = await RoomBooking.find({
    room: roomId,
    startDate: { $lte: end },
    endDate: { $gte: start },
    status: { $ne: "cancelled" },
  })
    .sort({ startDate: 1 })
    .populate("bookedBy", "name email")
    .lean();

  return bookings;
};

const getRoomStats = async () => {
  const totalRooms = await Room.countDocuments();
  const availableRooms = await Room.countDocuments({ isAvailable: true });
  const totalBookings = await RoomBooking.countDocuments({ status: { $ne: "cancelled" } });
  const activeNow = await RoomBooking.countDocuments({
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    status: "approved",
  });

  return { totalRooms, availableRooms, totalBookings, activeNow };
};

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomSchedule, getRoomStats };
