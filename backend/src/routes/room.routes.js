import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomSchedule,
  getRoomStats,
} from "../controllers/room.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getRooms);
router.get("/stats", getRoomStats);
router.get("/:id", getRoomById);
router.get("/:id/schedule", getRoomSchedule);
router.post("/", authorize("SUPER_ADMIN", "ADMIN"), createRoom);
router.put("/:id", authorize("SUPER_ADMIN", "ADMIN"), updateRoom);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), deleteRoom);

export default router;
