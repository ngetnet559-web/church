import User from "../models/User.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Attendance from "../models/Attendance.js";
import AttendanceSession from "../models/AttendanceSession.js";
import Certificate from "../models/Certificate.js";
import Donation from "../models/Donation.js";
import Expense from "../models/Expense.js";
import DonationCampaign from "../models/DonationCampaign.js";
import MemberProfile from "../models/MemberProfile.js";
import { ROLES } from "../constants/roles.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const dateRangePresets = {
  today: () => {
    const s = new Date(); s.setHours(0,0,0,0);
    const e = new Date(); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  yesterday: () => {
    const s = new Date(); s.setDate(s.getDate()-1); s.setHours(0,0,0,0);
    const e = new Date(); e.setDate(e.getDate()-1); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  thisWeek: () => {
    const s = new Date(); s.setDate(s.getDate()-s.getDay()); s.setHours(0,0,0,0);
    const e = new Date(); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  lastWeek: () => {
    const s = new Date(); s.setDate(s.getDate()-s.getDay()-7); s.setHours(0,0,0,0);
    const e = new Date(); e.setDate(e.getDate()-e.getDay()-1); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  thisMonth: () => {
    const s = new Date(); s.setDate(1); s.setHours(0,0,0,0);
    const e = new Date(); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  lastMonth: () => {
    const s = new Date(); s.setMonth(s.getMonth()-1, 1); s.setHours(0,0,0,0);
    const e = new Date(); e.setMonth(e.getMonth(), 0); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
  thisYear: () => {
    const s = new Date(); s.setMonth(0, 1); s.setHours(0,0,0,0);
    const e = new Date(); e.setHours(23,59,59,999);
    return { start: s, end: e };
  },
};

export function resolveDateRange(range, customStart, customEnd) {
  if (!range || range === "all") return {};
  if (range === "custom" && customStart && customEnd) {
    return { start: new Date(customStart), end: new Date(customEnd) };
  }
  const fn = dateRangePresets[range];
  if (!fn) return {};
  return fn();
}

function buildDateFilter(field, range, customStart, customEnd) {
  const { start, end } = resolveDateRange(range, customStart, customEnd);
  if (!start) return {};
  return { [field]: { $gte: start, $lte: end } };
}

function addLabel(entries) {
  return (entries || []).map((e) => {
    const id = e._id;
    if (typeof id === "object" && id !== null) {
      const y = id.year;
      const m = String(id.month || 1).padStart(2, "0");
      return { ...e, label: `${y}-${m}` };
    }
    return { ...e, label: id != null ? String(id) : "Unknown" };
  });
}

async function loadUsers(filters, currentUser) {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.status === "active") query.isActive = true;
  if (filters.status === "inactive") query.isActive = false;
  Object.assign(query, buildDateFilter("createdAt", filters.dateRange, filters.startDate, filters.endDate));

  if (currentUser.role === ROLES.TEACHER) {
    query._id = currentUser._id;
  }

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  const total = await User.countDocuments(query);
  const roleDist = await User.aggregate([
    { $match: query._id ? { _id: query._id } : {} },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);
  const active = await User.countDocuments({ ...query, isActive: true });
  const inactive = await User.countDocuments({ ...query, isActive: false });

  const monthly = await User.aggregate([
    { $match: query.createdAt ? { createdAt: query.createdAt } : {} },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    rows: users.map((u) => ({
      id: u._id, name: u.name, email: u.email, role: u.role,
      isActive: u.isActive, createdAt: u.createdAt,
    })),
    summary: { total, active, inactive, roleDistribution: roleDist, monthly: addLabel(monthly) },
  };
}

async function loadMembers(filters) {
  const query = {};
  if (filters.gender) query.gender = filters.gender;
  if (filters.status) query.status = filters.status;
  Object.assign(query, buildDateFilter("createdAt", filters.dateRange, filters.startDate, filters.endDate));

  const profiles = await MemberProfile.find(query).populate("userId", "name email").sort({ createdAt: -1 }).lean();
  const total = await MemberProfile.countDocuments(query);
  const genderDist = await MemberProfile.aggregate([
    { $match: query.gender ? { gender: query.gender } : {} },
    { $group: { _id: "$gender", count: { $sum: 1 } } },
  ]);
  const statusDist = await MemberProfile.aggregate([
    { $match: query.status ? { status: query.status } : {} },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    rows: profiles.map((p) => ({
      id: p._id, name: p.userId?.name || `${p.firstName} ${p.lastName}`.trim(),
      email: p.email || p.userId?.email, gender: p.gender,
      phone: p.phone, status: p.status, city: p.city,
      churchRole: p.churchRole, ministry: p.ministry,
      createdAt: p.createdAt,
    })),
    summary: { total, genderDistribution: genderDist, statusDistribution: statusDist },
  };
}

async function loadCourses(filters, currentUser) {
  const query = {};
  Object.assign(query, buildDateFilter("createdAt", filters.dateRange, filters.startDate, filters.endDate));

  if (currentUser.role === ROLES.TEACHER) {
    query.createdBy = currentUser._id;
  }

  const courses = await Course.find(query).populate("createdBy", "name email").sort({ createdAt: -1 }).lean();
  const total = await Course.countDocuments(query);

  const courseIds = courses.map((c) => c._id);
  const lessonCounts = await Lesson.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);
  const enrollmentCounts = await Enrollment.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);
  const completionCounts = await Enrollment.aggregate([
    { $match: { courseId: { $in: courseIds }, completed: true } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);

  const lessonMap = new Map(lessonCounts.map((l) => [l._id.toString(), l.count]));
  const enrollMap = new Map(enrollmentCounts.map((e) => [e._id.toString(), e.count]));
  const compMap = new Map(completionCounts.map((c) => [c._id.toString(), c.count]));

  const rows = courses.map((c) => {
    const eCount = enrollMap.get(c._id.toString()) || 0;
    const compCount = compMap.get(c._id.toString()) || 0;
    return {
      id: c._id, title: c.title, createdBy: c.createdBy?.name || "Unknown",
      lessonCount: lessonMap.get(c._id.toString()) || 0,
      enrollmentCount: eCount, completionCount: compCount,
      completionRate: eCount > 0 ? Math.round((compCount / eCount) * 100) : 0,
      createdAt: c.createdAt,
    };
  });

  return { rows, summary: { total } };
}

async function loadEnrollments(filters, currentUser) {
  const query = {};
  if (filters.courseId) query.courseId = filters.courseId;
  if (filters.completion !== undefined) query.completed = filters.completion === "completed";
  Object.assign(query, buildDateFilter("enrolledAt", filters.dateRange, filters.startDate, filters.endDate));

  if (currentUser.role === ROLES.STUDENT) query.userId = currentUser._id;
  if (currentUser.role === ROLES.PARENT) {
    const children = await MemberProfile.findOne({ userId: currentUser._id }).select("parentUsers").lean();
    const childIds = children?.parentUsers || [];
    query.userId = { $in: childIds };
  }

  const enrollments = await Enrollment.find(query)
    .populate("userId", "name email")
    .populate("courseId", "title")
    .sort({ enrolledAt: -1 }).lean();

  const total = await Enrollment.countDocuments(query);
  const completed = await Enrollment.countDocuments({ ...query, completed: true });
  const inProgress = await Enrollment.countDocuments({ ...query, completed: false });

  const monthly = await Enrollment.aggregate([
    { $match: query.enrolledAt ? { enrolledAt: query.enrolledAt } : {} },
    { $group: { _id: { year: { $year: "$enrolledAt" }, month: { $month: "$enrolledAt" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    rows: enrollments.map((e) => ({
      id: e._id, student: e.userId?.name || "Unknown", email: e.userId?.email,
      course: e.courseId?.title || "Unknown", progress: e.progress,
      completed: e.completed, enrolledAt: e.enrolledAt,
    })),
    summary: { total, completed, inProgress, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0, monthly: addLabel(monthly) },
  };
}

async function loadAttendance(filters) {
  const query = {};
  if (filters.sessionId) query.sessionId = filters.sessionId;
  if (filters.status) query.status = filters.status;
  Object.assign(query, buildDateFilter("checkInTime", filters.dateRange, filters.startDate, filters.endDate));

  const records = await Attendance.find(query)
    .populate("studentId", "name email")
    .populate("sessionId", "title date")
    .sort({ checkInTime: -1 }).lean();

  const total = await Attendance.countDocuments(query);
  const present = await Attendance.countDocuments({ ...query, status: "Present" });
  const late = await Attendance.countDocuments({ ...query, status: "Late" });
  const absent = await Attendance.countDocuments({ ...query, status: "Absent" });
  const excused = await Attendance.countDocuments({ ...query, status: "Excused" });
  const attended = present + late;
  const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

  const trend = await Attendance.aggregate([
    { $match: query.checkInTime ? { checkInTime: query.checkInTime } : {} },
    {
      $group: {
        _id: { year: { $year: "$checkInTime" }, month: { $month: "$checkInTime" } },
        present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    rows: records.map((r) => ({
      id: r._id, student: r.studentId?.name || "Unknown",
      email: r.studentId?.email, session: r.sessionId?.title || "Unknown",
      date: r.sessionId?.date, status: r.status,
      checkInTime: r.checkInTime,
    })),
    summary: { total, present, late, absent, excused, attendanceRate: rate, trend: addLabel(trend) },
  };
}

async function loadCertificates(filters) {
  const query = {};
  Object.assign(query, buildDateFilter("issuedDate", filters.dateRange, filters.startDate, filters.endDate));

  const certs = await Certificate.find(query)
    .populate("studentId", "name email")
    .populate("courseId", "title")
    .populate("issuedBy", "name")
    .sort({ issuedDate: -1 }).lean();

  const total = await Certificate.countDocuments(query);
  const monthly = await Certificate.aggregate([
    { $match: {} },
    { $group: { _id: { year: { $year: "$issuedDate" }, month: { $month: "$issuedDate" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    rows: certs.map((c) => ({
      id: c._id, student: c.studentId?.name || "Unknown",
      course: c.courseId?.title || "Unknown",
      certificateNumber: c.certificateNumber, issuedDate: c.issuedDate,
      issuedBy: c.issuedBy?.name || "Unknown",
    })),
    summary: { total, monthly: addLabel(monthly) },
  };
}

async function loadFinance(filters) {
  const donationFilter = buildDateFilter("donatedAt", filters.dateRange, filters.startDate, filters.endDate);
  const expenseFilter = buildDateFilter("expenseDate", filters.dateRange, filters.startDate, filters.endDate);

  const donationAgg = await Donation.aggregate([
    { $match: donationFilter.donatedAt ? { donatedAt: donationFilter.donatedAt } : {} },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const expenseAgg = await Expense.aggregate([
    { $match: expenseFilter.expenseDate ? { expenseDate: expenseFilter.expenseDate } : {} },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  const donations = donationAgg[0] || { total: 0, count: 0 };
  const expenses = expenseAgg[0] || { total: 0, count: 0 };
  const balance = donations.total - expenses.total;

  const donationTrend = await Donation.aggregate([
    { $match: donationFilter.donatedAt ? { donatedAt: donationFilter.donatedAt } : {} },
    { $group: { _id: { year: { $year: "$donatedAt" }, month: { $month: "$donatedAt" } }, amount: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  const expenseTrend = await Expense.aggregate([
    { $match: expenseFilter.expenseDate ? { expenseDate: expenseFilter.expenseDate } : {} },
    { $group: { _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } }, amount: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    summary: {
      totalDonations: donations.total, donationCount: donations.count,
      totalExpenses: expenses.total, expenseCount: expenses.count,
      balance,
      donationTrend: addLabel(donationTrend), expenseTrend: addLabel(expenseTrend),
    },
    rows: [],
  };
}

async function loadDonations(filters) {
  const query = {};
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.campaignId) query.campaignId = filters.campaignId;
  Object.assign(query, buildDateFilter("donatedAt", filters.dateRange, filters.startDate, filters.endDate));

  const records = await Donation.find(query).sort({ donatedAt: -1 }).lean();
  const total = await Donation.countDocuments(query);
  const totalAmount = await Donation.aggregate([
    { $match: query.donatedAt ? { donatedAt: query.donatedAt } : {} },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const byMethod = await Donation.aggregate([
    { $match: query.donatedAt ? { donatedAt: query.donatedAt } : {} },
    { $group: { _id: "$paymentMethod", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
  ]);

  return {
    rows: records.map((d) => ({
      id: d._id, donorName: d.donorName, donorEmail: d.donorEmail,
      amount: d.amount, currency: d.currency, paymentMethod: d.paymentMethod,
      paymentStatus: d.paymentStatus, donatedAt: d.donatedAt,
    })),
    summary: {
      total, totalAmount: totalAmount[0]?.total || 0,
      byPaymentMethod: byMethod,
    },
  };
}

async function loadExpenses(filters) {
  const query = { isDeleted: { $ne: true } };
  if (filters.category) query.category = filters.category;
  Object.assign(query, buildDateFilter("expenseDate", filters.dateRange, filters.startDate, filters.endDate));

  const records = await Expense.find(query).sort({ expenseDate: -1 }).lean();
  const total = await Expense.countDocuments(query);
  const totalAmount = await Expense.aggregate([
    { $match: { ...query, isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const byCategory = await Expense.aggregate([
    { $match: { ...query, isDeleted: { $ne: true } } },
    { $group: { _id: "$category", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
  ]);

  return {
    rows: records.map((e) => ({
      id: e._id, title: e.title, description: e.description,
      category: e.category, amount: e.amount, status: e.status,
      expenseDate: e.expenseDate,
    })),
    summary: { total, totalAmount: totalAmount[0]?.total || 0, byCategory },
  };
}

async function loadCampaigns(filters) {
  const query = { isDeleted: { $ne: true } };
  if (filters.status === "active") query.active = true;
  if (filters.status === "inactive") query.active = false;
  Object.assign(query, buildDateFilter("createdAt", filters.dateRange, filters.startDate, filters.endDate));

  const records = await DonationCampaign.find(query).sort({ createdAt: -1 }).lean();
  const total = await DonationCampaign.countDocuments(query);
  const activeCount = await DonationCampaign.countDocuments({ ...query, active: true, isDeleted: { $ne: true } });
  const totalGoal = records.reduce((s, c) => s + (c.goalAmount || 0), 0);
  const totalRaised = records.reduce((s, c) => s + (c.currentAmount || 0), 0);

  return {
    rows: records.map((c) => ({
      id: c._id, title: c.title, goalAmount: c.goalAmount,
      currentAmount: c.currentAmount, active: c.active,
      progress: c.goalAmount > 0 ? Math.round((c.currentAmount / c.goalAmount) * 100) : 0,
      startDate: c.startDate, endDate: c.endDate,
    })),
    summary: { total, activeCount, totalGoal, totalRaised },
  };
}

async function loadAnalytics(filters) {
  const [totalUsers, totalCourses, totalEnrollments, totalCertificates] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Certificate.countDocuments(),
  ]);

  const completed = await Enrollment.countDocuments({ completed: true });
  const completionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0;

  const attendanceRecords = await Attendance.countDocuments();
  const attended = await Attendance.countDocuments({ status: { $in: ["Present", "Late"] } });
  const attendanceRate = attendanceRecords > 0 ? Math.round((attended / attendanceRecords) * 100) : 0;

  const roleDist = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);

  return {
    summary: {
      totalUsers, totalCourses, totalEnrollments, totalCertificates,
      completionRate, attendanceRate, roleDistribution: roleDist,
    },
    rows: [],
  };
}

function buildCSV(rows, columns) {
  const header = columns.map((c) => `"${(c.label || c.key).replace(/"/g, '""')}"`).join(",");
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = getNestedValue(row, c.key);
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  );
  return [header, ...body].join("\n");
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

async function buildExcel(rows, columns, sheetName, summary) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sunday School LMS";

  if (summary) {
    const ws = wb.addWorksheet("Summary");
    ws.columns = [{ width: 30 }, { width: 20 }];
    let row = 1;
    for (const [k, v] of Object.entries(summary)) {
      if (typeof v === "object") continue;
      ws.getCell(`A${row}`).value = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
      ws.getCell(`B${row}`).value = v;
      ws.getCell(`A${row}`).font = { bold: true };
      row++;
    }
  }

  const ws = wb.addWorksheet(sheetName || "Report");
  ws.columns = columns.map((c) => ({
    header: c.label || c.key,
    key: c.key,
    width: Math.max(c.label?.length || 15, 12),
  }));
  ws.getRow(1).font = { bold: true };

  for (const r of rows) {
    ws.addRow(Object.fromEntries(columns.map((c) => [c.key, getNestedValue(r, c.key) ?? ""])));
  }

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

function buildPDF(title, rows, columns, summary, filters, user, res) {
  const doc = new PDFDocument({ margin: 50, size: "A4", layout: rows.length > 20 ? "landscape" : "portrait" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${title.replace(/\s+/g, "_").toLowerCase()}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).font("Helvetica-Bold").text("Sunday School LMS", { align: "center" });
  doc.fontSize(14).text(title, { align: "center" });
  doc.fontSize(10).font("Helvetica").text(`Generated by: ${user?.name || "System"}`, { align: "center" });
  doc.text(`Date: ${new Date().toLocaleString()}`, { align: "center" });

  if (filters && Object.keys(filters).length > 0) {
    doc.moveDown().fontSize(11).font("Helvetica-Bold").text("Filters Applied:");
    doc.fontSize(9).font("Helvetica");
    for (const [k, v] of Object.entries(filters)) {
      if (v) doc.text(`  ${k}: ${v}`);
    }
  }

  if (summary && Object.keys(summary).length > 0) {
    doc.moveDown().fontSize(11).font("Helvetica-Bold").text("Summary");
    doc.fontSize(9).font("Helvetica");
    for (const [k, v] of Object.entries(summary)) {
      if (typeof v === "object" || v === null || v === undefined) continue;
      doc.text(`  ${k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}: ${v}`);
    }
  }

  doc.moveDown().fontSize(11).font("Helvetica-Bold").text("Data");
  doc.fontSize(8).font("Helvetica");

  const tableTop = doc.y;
  const headers = columns.map((c) => c.label || c.key);

  const availableWidth = doc.page.width - 100;
  const colWidth = availableWidth / Math.max(headers.length, 1);

  headers.forEach((h, i) => doc.text(h, 50 + i * colWidth, tableTop, { width: colWidth, align: "left" }));
  doc.moveDown(0.5);

  let y = doc.y;
  for (const row of rows.slice(0, 200)) {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
    columns.forEach((c, i) => {
      const val = getNestedValue(row, c.key);
      doc.text(val !== undefined && val !== null ? String(val) : "", 50 + i * colWidth, y, { width: colWidth, align: "left" });
    });
    y += 16;
    doc.y = y;
  }

  doc.moveDown(2).fontSize(8).font("Helvetica-Oblique").text("Generated by Sunday School LMS Reporting System", { align: "center" });

  doc.end();
}

async function getReportData(reportType, filters, currentUser) {
  switch (reportType) {
    case "users": return loadUsers(filters, currentUser);
    case "members": return loadMembers(filters);
    case "courses": return loadCourses(filters, currentUser);
    case "enrollments": return loadEnrollments(filters, currentUser);
    case "attendance": return loadAttendance(filters);
    case "certificates": return loadCertificates(filters);
    case "finance": return loadFinance(filters);
    case "donations": return loadDonations(filters);
    case "expenses": return loadExpenses(filters);
    case "campaigns": return loadCampaigns(filters);
    case "analytics": return loadAnalytics(filters);
    default: throw new Error(`Unknown report type: ${reportType}`);
  }
}

const reportColumns = {
  users: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "isActive", label: "Active" },
    { key: "createdAt", label: "Created" },
  ],
  members: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "city", label: "City" },
    { key: "churchRole", label: "Church Role" },
    { key: "ministry", label: "Ministry" },
  ],
  courses: [
    { key: "title", label: "Title" },
    { key: "createdBy", label: "Created By" },
    { key: "lessonCount", label: "Lessons" },
    { key: "enrollmentCount", label: "Enrollments" },
    { key: "completionRate", label: "Completion %" },
    { key: "createdAt", label: "Created" },
  ],
  enrollments: [
    { key: "student", label: "Student" },
    { key: "email", label: "Email" },
    { key: "course", label: "Course" },
    { key: "progress", label: "Progress %" },
    { key: "completed", label: "Completed" },
    { key: "enrolledAt", label: "Enrolled" },
  ],
  attendance: [
    { key: "student", label: "Student" },
    { key: "email", label: "Email" },
    { key: "session", label: "Session" },
    { key: "status", label: "Status" },
    { key: "checkInTime", label: "Check In" },
  ],
  certificates: [
    { key: "student", label: "Student" },
    { key: "course", label: "Course" },
    { key: "certificateNumber", label: "Certificate #" },
    { key: "issuedDate", label: "Issued" },
    { key: "issuedBy", label: "Issued By" },
  ],
  donations: [
    { key: "donorName", label: "Donor" },
    { key: "donorEmail", label: "Email" },
    { key: "amount", label: "Amount" },
    { key: "currency", label: "Currency" },
    { key: "paymentMethod", label: "Method" },
    { key: "paymentStatus", label: "Status" },
    { key: "donatedAt", label: "Date" },
  ],
  expenses: [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "expenseDate", label: "Date" },
  ],
  campaigns: [
    { key: "title", label: "Title" },
    { key: "goalAmount", label: "Goal" },
    { key: "currentAmount", label: "Raised" },
    { key: "progress", label: "Progress %" },
    { key: "active", label: "Active" },
    { key: "startDate", label: "Start" },
    { key: "endDate", label: "End" },
  ],
};

export async function generateReport(reportType, filters, currentUser) {
  const data = await getReportData(reportType, filters, currentUser);
  const columns = reportColumns[reportType] || [];
  return { ...data, columns };
}

export async function exportReport(format, reportType, filters, currentUser) {
  const data = await getReportData(reportType, filters, currentUser);
  const columns = reportColumns[reportType] || [];

  if (format === "csv") {
    const csv = buildCSV(data.rows, columns);
    return { data: csv, contentType: "text/csv", ext: "csv" };
  }

  if (format === "excel") {
    const buf = await buildExcel(data.rows, columns, `${reportType}_report`, data.summary);
    return { data: buf, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx" };
  }

  if (format === "pdf") {
    return { data: null, contentType: "application/pdf", ext: "pdf", build: true, title: `${reportType} Report`, columns, rows: data.rows, summary: data.summary, filters };
  }

  throw new Error(`Unsupported format: ${format}`);
}

export function streamPDF(title, columns, rows, summary, filters, user, res) {
  buildPDF(title, rows, columns, summary, filters, user, res);
}

const reportTitles = {
  users: "Users Report",
  members: "Member Profiles Report",
  courses: "Course Report",
  enrollments: "Enrollment Report",
  attendance: "Attendance Report",
  certificates: "Certificate Report",
  finance: "Finance Report",
  donations: "Donation Report",
  expenses: "Expense Report",
  campaigns: "Campaign Report",
  analytics: "Analytics Report",
};

export function getReportTitle(reportType) {
  return reportTitles[reportType] || `${reportType} Report`;
}

export function getReportColumns(reportType) {
  return reportColumns[reportType] || [];
}
