import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  createBooking,
  getBookings,
  getMyBookings,
  updateBooking,
  deleteBooking,
  approveBooking,
  rejectBooking,
} from "../controllers/booking.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getBookings);
router.get("/my", getMyBookings);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), deleteBooking);
router.post("/:id/approve", authorize("SUPER_ADMIN", "ADMIN"), approveBooking);
router.post("/:id/reject", authorize("SUPER_ADMIN", "ADMIN"), rejectBooking);

export default router;
