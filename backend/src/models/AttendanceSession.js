import mongoose from "mongoose";
import {
  ATTENDANCE_PROGRAM_TYPES,
  ATTENDANCE_SESSION_STATUS,
} from "../constants/attendance.js";

const attendanceSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    programType: {
      type: String,
      enum: ATTENDANCE_PROGRAM_TYPES,
      required: [true, "Program type is required"],
    },
    date: {
      type: Date,
      required: [true, "Session date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Session start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "Session end time is required"],
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    status: {
      type: String,
      enum: ATTENDANCE_SESSION_STATUS,
      default: "Upcoming",
    },
  },
  {
    timestamps: true,
  },
);

attendanceSessionSchema.index({ createdBy: 1 });
attendanceSessionSchema.index({ courseId: 1 });
attendanceSessionSchema.index({ date: 1 });

const AttendanceSession = mongoose.model(
  "AttendanceSession",
  attendanceSessionSchema,
);

export default AttendanceSession;
