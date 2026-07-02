import Certificate from "../models/Certificate.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import crypto from "crypto";

const formatCertificate = (certificate) => ({
  id: certificate._id,
  studentId: certificate.studentId,
  courseId: certificate.courseId,
  certificateNumber: certificate.certificateNumber,
  issuedDate: certificate.issuedDate,
  issuedBy: certificate.issuedBy,
  pdfUrl: certificate.pdfUrl,
  verificationCode: certificate.verificationCode,
});

const generateCertificateNumber = () =>
  `SSC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const generateVerificationCode = () => crypto.randomBytes(10).toString("hex");

export const getCertificates = async (user) => {
  const query = { studentId: user._id };
  const certificates = await Certificate.find(query)
    .populate("courseId", "title")
    .populate("issuedBy", "name email")
    .sort({ issuedDate: -1 });

  return certificates.map((certificate) => ({
    ...formatCertificate(certificate),
    course: certificate.courseId
      ? { id: certificate.courseId._id, title: certificate.courseId.title }
      : undefined,
    issuedBy: certificate.issuedBy
      ? { id: certificate.issuedBy._id, name: certificate.issuedBy.name }
      : undefined,
  }));
};

export const getCertificateById = async (user, certificateId) => {
  const certificate = await Certificate.findById(certificateId)
    .populate("studentId", "name email")
    .populate("courseId", "title")
    .populate("issuedBy", "name email");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  if (
    certificate.studentId.toString() !== user._id.toString() &&
    user.role !== ROLES.SUPER_ADMIN &&
    user.role !== ROLES.ADMIN
  ) {
    throw new ApiError(
      403,
      "You do not have permission to view this certificate",
    );
  }

  return {
    ...formatCertificate(certificate),
    student: certificate.studentId
      ? { id: certificate.studentId._id, name: certificate.studentId.name }
      : undefined,
    course: certificate.courseId
      ? { id: certificate.courseId._id, title: certificate.courseId.title }
      : undefined,
    issuedBy: certificate.issuedBy
      ? { id: certificate.issuedBy._id, name: certificate.issuedBy.name }
      : undefined,
  };
};

export const verifyCertificate = async (verificationCode) => {
  const certificate = await Certificate.findOne({ verificationCode })
    .populate("courseId", "title")
    .populate("studentId", "name email")
    .populate("issuedBy", "name email");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  return {
    ...formatCertificate(certificate),
    student: certificate.studentId
      ? { id: certificate.studentId._id, name: certificate.studentId.name }
      : undefined,
    course: certificate.courseId
      ? { id: certificate.courseId._id, title: certificate.courseId.title }
      : undefined,
    issuedBy: certificate.issuedBy
      ? { id: certificate.issuedBy._id, name: certificate.issuedBy.name }
      : undefined,
  };
};

export const issueCertificateForEnrollment = async (enrollment) => {
  if (enrollment.progress !== 100 || !enrollment.completed) {
    return null;
  }

  const existing = await Certificate.findOne({
    studentId: enrollment.userId,
    courseId: enrollment.courseId,
  });
  if (existing) {
    return existing;
  }

  const course = await Course.findById(enrollment.courseId);
  if (!course) {
    throw new ApiError(404, "Course not found for certificate");
  }

  const student = await User.findById(enrollment.userId);
  if (!student) {
    throw new ApiError(404, "Student not found for certificate");
  }

  const issuer = await User.findById(course.createdBy);
  if (!issuer) {
    throw new ApiError(404, "Issuer not found for certificate");
  }

  const certificate = await Certificate.create({
    studentId: student._id,
    courseId: course._id,
    certificateNumber: generateCertificateNumber(),
    issuedDate: new Date(),
    issuedBy: issuer._id,
    pdfUrl: "",
    verificationCode: generateVerificationCode(),
  });

  return certificate;
};

export const getCertificateStats = async (user) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to view certificate stats");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [total, thisMonth, thisYear, recentCertificates] = await Promise.all([
    Certificate.countDocuments(),
    Certificate.countDocuments({ issuedDate: { $gte: startOfMonth } }),
    Certificate.countDocuments({ issuedDate: { $gte: startOfYear } }),
    Certificate.find()
      .populate("studentId", "name email")
      .populate("courseId", "title")
      .sort({ issuedDate: -1 })
      .limit(5),
  ]);

  const monthlyBreakdown = await Certificate.aggregate([
    {
      $match: {
        issuedDate: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$issuedDate" },
          month: { $month: "$issuedDate" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return {
    total,
    thisMonth,
    thisYear,
    monthlyBreakdown: monthlyBreakdown.map((entry) => ({
      label: `${monthNames[entry._id.month - 1]} ${entry._id.year}`,
      count: entry.count,
    })),
    recentCertificates: recentCertificates.map((cert) => ({
      id: cert._id,
      studentName: cert.studentId?.name,
      courseTitle: cert.courseId?.title,
      issuedDate: cert.issuedDate,
      certificateNumber: cert.certificateNumber,
    })),
  };
};
