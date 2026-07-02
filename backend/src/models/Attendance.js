import mongoose from "mongoose";
import { ATTENDANCE_STATUS } from "../constants/attendance.js";

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUS,
      required: [true, "Attendance status is required"],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    checkInMethod: {
      type: String,
      default: "manual",
      trim: true,
    },
    checkInMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, sessionId: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
