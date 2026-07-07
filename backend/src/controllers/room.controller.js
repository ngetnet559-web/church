import * as roomService from "../services/room.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getRooms = asyncHandler(async (req, res) => {
  const result = await roomService.getRooms({ ...req.query, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 50 });
  res.json(new ApiResponse(200, result, "Rooms fetched"));
});

const getRoomById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  if (!room) throw new ApiError(404, "Room not found");
  res.json(new ApiResponse(200, room, "Room fetched"));
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body);
  res.status(201).json(new ApiResponse(201, room, "Room created"));
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body);
  if (!room) throw new ApiError(404, "Room not found");
  res.json(new ApiResponse(200, room, "Room updated"));
});

const deleteRoom = asyncHandler(async (req, res) => {
  const room = await roomService.deleteRoom(req.params.id);
  if (!room) throw new ApiError(404, "Room not found");
  res.json(new ApiResponse(200, null, "Room deleted"));
});

const getRoomSchedule = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw new ApiError(400, "Date query parameter is required");
  const bookings = await roomService.getRoomSchedule(req.params.id, date);
  res.json(new ApiResponse(200, bookings, "Room schedule fetched"));
});

const getRoomStats = asyncHandler(async (req, res) => {
  const stats = await roomService.getRoomStats();
  res.json(new ApiResponse(200, stats, "Room stats fetched"));
});

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomSchedule, getRoomStats };
