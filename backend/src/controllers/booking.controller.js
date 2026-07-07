import * as bookingService from "../services/booking.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, booking, "Booking created"));
});

const getBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookings({ ...req.query, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 });
  res.json(new ApiResponse(200, result, "Bookings fetched"));
});

const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookings({ userId: req.user.id, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 });
  res.json(new ApiResponse(200, result, "My bookings fetched"));
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBooking(req.params.id, req.body, req.user.id);
  res.json(new ApiResponse(200, booking, "Booking updated"));
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.deleteBooking(req.params.id);
  if (!booking) return res.status(404).json(new ApiResponse(404, null, "Booking not found"));
  res.json(new ApiResponse(200, null, "Booking deleted"));
});

const approveBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.approveBooking(req.params.id);
  res.json(new ApiResponse(200, booking, "Booking approved"));
});

const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.rejectBooking(req.params.id, req.body.reason);
  res.json(new ApiResponse(200, booking, "Booking rejected"));
});

export { createBooking, getBookings, getMyBookings, updateBooking, deleteBooking, approveBooking, rejectBooking };
