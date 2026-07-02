import * as attendanceService from "../services/attendance.service.js";

export const createSession = async (req, res) => {
  const session = await attendanceService.createSession(req.user, req.body);
  res.status(201).json({ success: true, data: { session } });
};

export const getSessions = async (req, res) => {
  const sessions = await attendanceService.getSessions(req.user, req.query);
  res.status(200).json({ success: true, data: { sessions } });
};

export const getSessionById = async (req, res) => {
  const session = await attendanceService.getSessionById(
    req.user,
    req.params.id,
  );
  res.status(200).json({ success: true, data: { session } });
};

export const updateSession = async (req, res) => {
  const session = await attendanceService.updateSession(
    req.user,
    req.params.id,
    req.body,
  );
  res.status(200).json({ success: true, data: { session } });
};

export const deleteSession = async (req, res) => {
  const result = await attendanceService.deleteSession(req.user, req.params.id);
  res.status(200).json({ success: true, data: result });
};

export const recordAttendance = async (req, res) => {
  const attendance = await attendanceService.recordAttendance(
    req.user,
    req.body,
  );
  res.status(201).json({ success: true, data: { attendance } });
};

export const getStats = async (req, res) => {
  const stats = await attendanceService.getStats(req.user);
  res.status(200).json({ success: true, data: { stats } });
};

export const getMyAttendance = async (req, res) => {
  const attendance = await attendanceService.getMyAttendance(
    req.user,
    req.query.studentId,
  );
  res.status(200).json({ success: true, data: { attendance } });
};

export const getUpcomingSessions = async (req, res) => {
  const sessions = await attendanceService.getUpcomingSessions(req.user);
  res.status(200).json({ success: true, data: { sessions } });
};

export const getCourseAttendance = async (req, res) => {
  const sessions = await attendanceService.getCourseAttendance(req.user, req.params.courseId);
  res.status(200).json({ success: true, data: { sessions } });
};

export const recordBulkAttendance = async (req, res) => {
  const results = await attendanceService.recordBulkAttendance(req.user, req.body);
  res.status(201).json({ success: true, data: { attendance: results } });
};

export const searchStudents = async (req, res) => {
  const students = await attendanceService.searchStudents(req.user, req.query.q);
  res.status(200).json({ success: true, data: { students } });
};
