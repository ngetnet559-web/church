import mongoose from "mongoose";
import AttendanceSession from "../models/AttendanceSession.js";
import Attendance from "../models/Attendance.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import {
  ATTENDANCE_PROGRAM_TYPES,
  ATTENDANCE_SESSION_STATUS,
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";
import { ROLES } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";

const formatSession = (session) => ({
  id: session._id,
  title: session.title,
  description: session.description,
  programType: session.programType,
  date: session.date,
  startTime: session.startTime,
  endTime: session.endTime,
  location: session.location,
  status: session.status,
  courseId: session.courseId,
  course: session.courseId
    ? {
        id: session.courseId._id,
        title: session.courseId.title,
      }
    : undefined,
  createdBy: session.createdBy
    ? {
        id: session.createdBy._id,
        name: session.createdBy.name,
        email: session.createdBy.email,
      }
    : undefined,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

const requireTeacherAccess = (user, session) => {
  if (
    user.role === ROLES.TEACHER &&
    session.createdBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only manage your own attendance sessions");
  }
};

export const createSession = async (user, data) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(
      403,
      "You do not have permission to create attendance sessions",
    );
  }

  const required = ["title", "programType", "date", "startTime", "endTime"];
  for (const field of required) {
    if (!data[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  if (!ATTENDANCE_PROGRAM_TYPES.includes(data.programType)) {
    throw new ApiError(400, "Invalid program type");
  }

  if (data.status && !ATTENDANCE_SESSION_STATUS.includes(data.status)) {
    throw new ApiError(400, "Invalid session status");
  }

  const session = await AttendanceSession.create({
    title: data.title.trim(),
    description: data.description?.trim() || "",
    programType: data.programType,
    date: new Date(data.date),
    startTime: data.startTime.trim(),
    endTime: data.endTime.trim(),
    location: data.location?.trim() || "",
    createdBy: user._id,
    courseId: data.courseId || undefined,
    status: data.status || "Upcoming",
  });

  await session.populate("createdBy", "name email");
  await session.populate("courseId", "title");
  return formatSession(session);
};

export const getSessions = async (user, filters = {}) => {
  const query = {};
  if (user.role === ROLES.TEACHER) {
    query.createdBy = user._id;
  }
  if (filters.courseId) {
    query.courseId = filters.courseId;
  }

  const sessions = await AttendanceSession.find(query)
    .populate("createdBy", "name email")
    .populate("courseId", "title")
    .sort({ date: -1, createdAt: -1 });

  return sessions.map(formatSession);
};

export const getSessionById = async (user, sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid session id");
  }

  const session = await AttendanceSession.findById(sessionId)
    .populate("createdBy", "name email")
    .populate("courseId", "title");
  if (!session) {
    throw new ApiError(404, "Attendance session not found");
  }

  if (user.role === ROLES.TEACHER) {
    requireTeacherAccess(user, session);
  }

  const attendanceRecords = await Attendance.find({ sessionId: session._id })
    .populate("studentId", "name email")
    .sort({ createdAt: 1 });

  const attendanceList = attendanceRecords.map((record) => ({
    id: record._id,
    student: record.studentId
      ? {
          id: record.studentId._id,
          name: record.studentId.name,
          email: record.studentId.email,
        }
      : undefined,
    status: record.status,
    notes: record.notes,
    checkInTime: record.checkInTime,
  }));

  let enrolledStudents = [];
  if (session.courseId) {
    const enrollments = await Enrollment.find({
      courseId: session.courseId._id,
    }).populate("userId", "name email");
    enrolledStudents = enrollments.map((enrollment) => {
      const attendance = attendanceList.find(
        (item) =>
          item.student?.id.toString() === enrollment.userId._id.toString(),
      );
      return {
        id: enrollment.userId._id,
        name: enrollment.userId.name,
        email: enrollment.userId.email,
        attendance: attendance
          ? {
              status: attendance.status,
              notes: attendance.notes,
              checkInTime: attendance.checkInTime,
            }
          : null,
      };
    });
  } else {
    const students = await User.find({ role: ROLES.STUDENT, isActive: true })
      .select("name email")
      .sort({ name: 1 });
    enrolledStudents = students.map((student) => {
      const attendance = attendanceList.find(
        (item) => item.student?.id.toString() === student._id.toString(),
      );
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        attendance: attendance
          ? {
              status: attendance.status,
              notes: attendance.notes,
              checkInTime: attendance.checkInTime,
            }
          : null,
      };
    });
  }

  return {
    ...formatSession(session),
    attendance: attendanceList,
    enrolledStudents,
  };
};

export const updateSession = async (user, sessionId, data) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid session id");
  }

  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Attendance session not found");
  }

  if (user.role === ROLES.TEACHER) {
    requireTeacherAccess(user, session);
  }

  if (data.title !== undefined) session.title = data.title.trim();
  if (data.description !== undefined) {
    session.description = data.description.trim();
  }
  if (data.programType !== undefined) {
    if (!ATTENDANCE_PROGRAM_TYPES.includes(data.programType)) {
      throw new ApiError(400, "Invalid program type");
    }
    session.programType = data.programType;
  }
  if (data.date !== undefined) session.date = new Date(data.date);
  if (data.startTime !== undefined) session.startTime = data.startTime.trim();
  if (data.endTime !== undefined) session.endTime = data.endTime.trim();
  if (data.location !== undefined) session.location = data.location.trim();
  if (data.status !== undefined) {
    if (!ATTENDANCE_SESSION_STATUS.includes(data.status)) {
      throw new ApiError(400, "Invalid session status");
    }
    session.status = data.status;
  }

  await session.save();
  await session.populate("createdBy", "name email");
  await session.populate("courseId", "title");
  return formatSession(session);
};

export const deleteSession = async (user, sessionId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid session id");
  }

  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Attendance session not found");
  }

  if (user.role === ROLES.TEACHER) {
    requireTeacherAccess(user, session);
  }

  await Attendance.deleteMany({ sessionId: session._id });
  await session.deleteOne();

  return { message: "Attendance session deleted successfully" };
};

export const recordAttendance = async (user, data) => {
  const required = ["studentId", "sessionId", "status"];
  for (const field of required) {
    if (!data[field]) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  if (!mongoose.Types.ObjectId.isValid(data.sessionId)) {
    throw new ApiError(400, "Invalid session id");
  }

  if (!mongoose.Types.ObjectId.isValid(data.studentId)) {
    throw new ApiError(400, "Invalid student id");
  }

  if (!ATTENDANCE_STATUS.includes(data.status)) {
    throw new ApiError(400, "Invalid attendance status");
  }

  const session = await AttendanceSession.findById(data.sessionId);
  if (!session) {
    throw new ApiError(404, "Attendance session not found");
  }

  if (user.role === ROLES.TEACHER) {
    requireTeacherAccess(user, session);
  }

  const student = await User.findById(data.studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (session.courseId) {
    const enrollment = await Enrollment.findOne({
      courseId: session.courseId,
      userId: data.studentId,
    });
    if (!enrollment) {
      throw new ApiError(
        400,
        "Student is not enrolled in the course associated with this session",
      );
    }
  }

  const attendance = await Attendance.findOneAndUpdate(
    { sessionId: session._id, studentId: data.studentId },
    {
      status: data.status,
      notes: data.notes?.trim() || "",
      checkInTime: data.checkInTime ? new Date(data.checkInTime) : Date.now(),
      checkInMethod: data.checkInMethod || "manual",
      checkInMetadata: data.checkInMetadata || {},
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await attendance.populate("studentId", "name email");
  await attendance.populate("sessionId", "title date");

  return {
    id: attendance._id,
    session: attendance.sessionId
      ? {
          id: attendance.sessionId._id,
          title: attendance.sessionId.title,
          date: attendance.sessionId.date,
        }
      : null,
    student: attendance.studentId
      ? {
          id: attendance.studentId._id,
          name: attendance.studentId.name,
          email: attendance.studentId.email,
        }
      : null,
    status: attendance.status,
    notes: attendance.notes,
    checkInTime: attendance.checkInTime,
    updatedAt: attendance.updatedAt,
  };
};

const buildAttendanceSummary = (records) => {
  const history = records.map((record) => ({
    id: record._id,
    sessionId: record.sessionId?._id,
    sessionTitle: record.sessionId?.title,
    sessionDate: record.sessionId?.date,
    programType: record.sessionId?.programType,
    sessionStatus: record.sessionId?.status,
    startTime: record.sessionId?.startTime,
    endTime: record.sessionId?.endTime,
    location: record.sessionId?.location,
    status: record.status,
    notes: record.notes,
    checkInTime: record.checkInTime,
  }));

  const counts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
  for (const record of records) {
    counts[record.status] = (counts[record.status] || 0) + 1;
  }
  const total = records.length;
  const attendancePercent =
    total === 0 ? 0 : Math.round(((counts.Present + counts.Late) / total) * 100);

  return {
    attendancePercent,
    presentCount: counts.Present,
    lateCount: counts.Late,
    absentCount: counts.Absent,
    excusedCount: counts.Excused,
    totalSessions: total,
    history,
  };
};

export const getMyAttendance = async (user, studentId) => {
  let targetStudentId = user._id;

  if (user.role === ROLES.PARENT) {
    if (!studentId) {
      throw new ApiError(400, "studentId is required for parent attendance view");
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new ApiError(400, "Invalid student id");
    }
    targetStudentId = studentId;
  } else if (user.role !== ROLES.STUDENT) {
    throw new ApiError(403, "Only students and parents can view attendance history");
  }

  const records = await Attendance.find({ studentId: targetStudentId })
    .populate("sessionId", "title date programType status startTime endTime location")
    .sort({ checkInTime: -1 });

  return buildAttendanceSummary(records);
};

export const getStats = async (user) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view attendance stats");
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayRecords, weeklyRecords, monthlyRecords, absentTodayRecords] = await Promise.all([
    Attendance.find({ checkInTime: { $gte: startOfToday } })
      .populate("studentId", "name email")
      .populate("sessionId", "title"),
    Attendance.find({ checkInTime: { $gte: startOfWeek } })
      .populate("studentId", "name email")
      .populate("sessionId", "title"),
    Attendance.find({ checkInTime: { $gte: startOfMonth } })
      .populate("studentId", "name email")
      .populate("sessionId", "title"),
    Attendance.find({ status: "Absent", checkInTime: { $gte: startOfToday } })
      .populate("studentId", "name email"),
  ]);

  const summarize = (records) => {
    const counts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };

    for (const record of records) {
      counts[record.status] = (counts[record.status] || 0) + 1;
    }

    const total = records.length;
    const attendancePercent =
      total === 0 ? 0 : Math.round(((counts.Present + counts.Late) / total) * 100);

    return {
      attendancePercent,
      present: counts.Present,
      late: counts.Late,
      absent: counts.Absent,
      excused: counts.Excused,
      total,
    };
  };

  const trend = [];
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const dayRecords = await Attendance.find({ checkInTime: { $gte: start, $lt: end } })
      .populate("studentId", "name email")
      .populate("sessionId", "title");
    const daySummary = summarize(dayRecords);
    trend.push({
      date: start.toISOString().slice(0, 10),
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      attendancePercent: daySummary.attendancePercent,
    });
  }

  const studentsAbsentToday = absentTodayRecords
    .filter((record) => record.studentId)
    .map((record) => ({
      id: record.studentId._id,
      name: record.studentId.name,
      email: record.studentId.email,
    }));

  const studentIds = monthlyRecords.reduce((ids, record) => {
    if (record.studentId) {
      ids.push(record.studentId._id.toString());
    }
    return ids;
  }, []);

  const uniqueStudentIds = [...new Set(studentIds)];
  const students = await User.find({ _id: { $in: uniqueStudentIds } })
    .select("name email")
    .sort({ name: 1 });

  const studentMap = new Map(students.map((student) => [student._id.toString(), student]));
  const attendanceByStudent = new Map();

  for (const record of monthlyRecords) {
    const studentId = record.studentId?._id?.toString();
    if (!studentId) continue;

    const existing = attendanceByStudent.get(studentId) || { total: 0, attended: 0 };
    existing.total += 1;
    if (record.status === "Present" || record.status === "Late") {
      existing.attended += 1;
    }
    attendanceByStudent.set(studentId, existing);
  }

  const topAttendanceStudents = [...attendanceByStudent.entries()]
    .map(([studentId, stats]) => {
      const student = studentMap.get(studentId);
      const attendancePercent =
        stats.total === 0 ? 0 : Math.round((stats.attended / stats.total) * 100);
      return {
        id: studentId,
        name: student?.name || "Unknown Student",
        email: student?.email || "",
        attendancePercent,
      };
    })
    .sort((a, b) => b.attendancePercent - a.attendancePercent)
    .slice(0, 5);

  return {
    today: summarize(todayRecords),
    weekly: summarize(weeklyRecords),
    monthly: summarize(monthlyRecords),
    averageAttendancePercent:
      monthlyRecords.length === 0 ? 0 : summarize(monthlyRecords).attendancePercent,
    trend,
    studentsAbsentToday,
    topAttendanceStudents,
  };
};

export const getUpcomingSessions = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = {
    date: { $gte: today },
    status: { $in: ["Upcoming", "Ongoing"] },
  };

  if (user.role === ROLES.TEACHER) {
    query.createdBy = user._id;
  }

  if (user.role === ROLES.STUDENT) {
    const enrollments = await Enrollment.find({ userId: user._id }).select("courseId");
    const courseIds = enrollments.map((enrollment) => enrollment.courseId);
    query.$or = [
      { courseId: { $in: courseIds } },
      { courseId: { $exists: false } },
      { courseId: null },
    ];
  }

  const sessions = await AttendanceSession.find(query)
    .populate("courseId", "title")
    .sort({ date: 1, startTime: 1 })
    .limit(20);

  return sessions.map((session) => ({
    id: session._id,
    title: session.title,
    programType: session.programType,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    location: session.location,
    status: session.status,
    course: session.courseId
      ? { id: session.courseId._id, title: session.courseId.title }
      : undefined,
  }));
};

export const getCourseAttendance = async (user, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course id");
  }

  const isStaff = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER].includes(user.role);

  if (user.role === ROLES.STUDENT) {
    const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (!enrollment) {
      throw new ApiError(403, "You must be enrolled to view course attendance");
    }
  } else if (!isStaff) {
    throw new ApiError(403, "You do not have permission to view course attendance");
  }

  const sessions = await AttendanceSession.find({ courseId }).sort({ date: -1 });

  if (user.role === ROLES.STUDENT) {
    const sessionIds = sessions.map((session) => session._id);
    const records = await Attendance.find({
      studentId: user._id,
      sessionId: { $in: sessionIds },
    });
    const recordMap = new Map(records.map((record) => [record.sessionId.toString(), record]));

    return sessions.map((session) => ({
      id: session._id,
      title: session.title,
      programType: session.programType,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      status: session.status,
      myAttendance: recordMap.has(session._id.toString())
        ? {
            status: recordMap.get(session._id.toString()).status,
            notes: recordMap.get(session._id.toString()).notes,
            checkInTime: recordMap.get(session._id.toString()).checkInTime,
          }
        : null,
    }));
  }

  return sessions.map(formatSession);
};

export const recordBulkAttendance = async (user, data) => {
  const { sessionId, records } = data;
  if (!sessionId || !Array.isArray(records) || records.length === 0) {
    throw new ApiError(400, "sessionId and records array are required");
  }

  const results = [];
  for (const record of records) {
    const result = await recordAttendance(user, {
      sessionId,
      studentId: record.studentId,
      status: record.status,
      notes: record.notes,
      checkInMethod: record.checkInMethod,
      checkInMetadata: record.checkInMetadata,
    });
    results.push(result);
  }
  return results;
};

export const searchStudents = async (user, query) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to search students");
  }

  const filter = { role: ROLES.STUDENT, isActive: true };
  if (query?.trim()) {
    const search = query.trim();
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const students = await User.find(filter).select("name email").sort({ name: 1 }).limit(50);
  return students.map((student) => ({ id: student._id, name: student.name, email: student.email }));
};
