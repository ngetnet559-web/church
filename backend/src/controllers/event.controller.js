import * as eventService from "../services/event.service.js";
import * as registrationService from "../services/registration.service.js";
import * as reminderService from "../services/reminder.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import EventCategory from "../models/EventCategory.js";

const getEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getEvents({ ...req.query, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 });
  res.json(new ApiResponse(200, result, "Events fetched"));
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  res.json(new ApiResponse(200, event, "Event fetched"));
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user.id);

  try {
    await reminderService.createReminders(event._id);
  } catch {
    // silent
  }

  res.status(201).json(new ApiResponse(201, event, "Event created"));
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  res.json(new ApiResponse(200, event, "Event updated"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await eventService.deleteEvent(req.params.id);
  if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  res.json(new ApiResponse(200, null, "Event deleted"));
});

const cancelEvent = asyncHandler(async (req, res) => {
  const event = await eventService.cancelEvent(req.params.id, req.body.reason);
  if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  res.json(new ApiResponse(200, event, "Event cancelled"));
});

const duplicateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.duplicateEvent(req.params.id);
  if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
  res.status(201).json(new ApiResponse(201, event, "Event duplicated"));
});

const getUpcomingEvents = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const events = await eventService.getUpcomingEvents(limit);
  res.json(new ApiResponse(200, events, "Upcoming events fetched"));
});

const getTodaysEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getTodaysEvents();
  res.json(new ApiResponse(200, events, "Today's events fetched"));
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await EventCategory.find().sort({ name: 1 }).lean();
  res.json(new ApiResponse(200, categories, "Categories fetched"));
});

const rsvpEvent = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const registration = await registrationService.createOrUpdateRSVP(req.params.id, req.user.id, status);
  res.json(new ApiResponse(200, registration, "RSVP updated"));
});

const getRegistrations = asyncHandler(async (req, res) => {
  const result = await registrationService.getRegistrations(req.params.id);
  res.json(new ApiResponse(200, result, "Registrations fetched"));
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getUserRegistrations(req.user.id);
  res.json(new ApiResponse(200, registrations, "My registrations fetched"));
});

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
  getCategories,
  rsvpEvent,
  getRegistrations,
  getMyRegistrations,
};
