import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
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
} from "../controllers/event.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/today", getTodaysEvents);
router.get("/categories", getCategories);
router.get("/:id", getEventById);
router.post("/", authorize("SUPER_ADMIN", "ADMIN", "TEACHER"), createEvent);
router.put("/:id", authorize("SUPER_ADMIN", "ADMIN", "TEACHER"), updateEvent);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), deleteEvent);
router.post("/:id/cancel", authorize("SUPER_ADMIN", "ADMIN", "TEACHER"), cancelEvent);
router.post("/:id/duplicate", authorize("SUPER_ADMIN", "ADMIN", "TEACHER"), duplicateEvent);

router.post("/:id/rsvp", rsvpEvent);
router.get("/:id/registrations", getRegistrations);

router.get("/my/registrations", getMyRegistrations);

export default router;
