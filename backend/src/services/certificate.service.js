import Certificate from "../models/Certificate.js";
import CertificateDownloadRequest from "../models/CertificateDownloadRequest.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import crypto from "crypto";

const SCHOOL_NAME = "Sunday School";

const generateCertificateSvg = (certificate, studentName, courseTitle, showWatermark = false) => {
  const date = new Date(certificate.issuedDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const watermark = showWatermark
    ? `<g transform="translate(400,300) rotate(-35)">
    <text class="watermark" text-anchor="middle" x="0" y="0">PREVIEW ONLY</text>
    <text class="watermark" text-anchor="middle" x="0" y="40">DOWNLOAD REQUIRES APPROVAL</text>
  </g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <style>
      .watermark { fill: #dc2626; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif; opacity: 0.25; }
    </style>
  </defs>
  <rect width="800" height="600" fill="#fefce8"/>
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="8,4"/>
  <rect x="30" y="30" width="740" height="540" fill="#fffbeb" rx="8"/>
  <rect x="35" y="35" width="730" height="530" fill="none" stroke="#fde68a" stroke-width="1"/>
  ${watermark}
  <circle cx="400" cy="100" r="36" fill="#e0e7ff"/>
  <text x="400" y="108" text-anchor="middle" font-size="22" font-weight="bold" fill="#4338ca">SS</text>
  <text x="400" y="155" text-anchor="middle" font-size="13" font-weight="600" fill="#4f46e5" letter-spacing="8">SUNDAY SCHOOL</text>
  <text x="400" y="210" text-anchor="middle" font-size="36" font-family="serif" font-weight="bold" fill="#1e293b">Certificate of Completion</text>
  <text x="400" y="260" text-anchor="middle" font-size="16" fill="#64748b">This is to certify that</text>
  <text x="400" y="310" text-anchor="middle" font-size="28" font-family="serif" font-weight="bold" fill="#4338ca">${studentName}</text>
  <text x="400" y="360" text-anchor="middle" font-size="16" fill="#64748b">has successfully completed the course</text>
  <text x="400" y="410" text-anchor="middle" font-size="24" font-family="serif" font-weight="600" fill="#1e293b">${courseTitle}</text>
  <text x="400" y="450" text-anchor="middle" font-size="14" fill="#94a3b8">Completion Date: ${date}</text>
  <text x="400" y="490" text-anchor="middle" font-size="11" fill="#94a3b8">Certificate No: ${certificate.certificateNumber}</text>
  <text x="400" y="510" text-anchor="middle" font-size="11" fill="#94a3b8">Code: ${certificate.verificationCode}</text>
</svg>`;
};

const formatCertificate = (certificate) => {
  const completedAt = certificate.completedAt || certificate.issuedDate;
  return {
    id: certificate._id,
    studentId: certificate.studentId,
    courseId: certificate.courseId,
    certificateNumber: certificate.certificateNumber,
    issuedDate: certificate.issuedDate,
    issuedBy: certificate.issuedBy,
    pdfUrl: certificate.pdfUrl,
    previewImage: certificate.previewImage,
    originalFile: certificate.originalFile,
    completedAt,
    completionDate: completedAt,
    verificationCode: certificate.verificationCode,
  };
};

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
  console.log(`[getCertificateById] certificateId=${certificateId} userId=${user._id}`);

  const certificate = await Certificate.findById(certificateId)
    .populate("studentId", "name email")
    .populate("courseId", "title")
    .populate("issuedBy", "name email");

  if (!certificate) {
    console.log(`[getCertificateById] Certificate not found: ${certificateId}`);
    throw new ApiError(404, "Certificate not found");
  }

  if (!certificate.studentId) {
    console.log(`[getCertificateById] Certificate ${certificateId} has no student (deleted user?)`);
    throw new ApiError(400, "Certificate owner no longer exists");
  }

  if (
    !certificate.studentId._id.equals(user._id) &&
    user.role !== ROLES.SUPER_ADMIN &&
    user.role !== ROLES.ADMIN
  ) {
    console.log(`[getCertificateById] User ${user._id} not authorized for certificate ${certificateId} owned by ${certificate.studentId._id}`);
    throw new ApiError(
      403,
      "You do not have permission to view this certificate",
    );
  }

  let downloadStatus = null;
  if (certificate.studentId._id.equals(user._id)) {
    const request = await CertificateDownloadRequest.findOne({
      student: user._id,
      certificate: certificateId,
    }).sort({ createdAt: -1 });
    if (request) {
      downloadStatus = request.status;
    }
  }

  return {
    ...formatCertificate(certificate),
    downloadStatus,
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

export const getCertificatePreview = async (user, certificateId) => {
  console.log(`[getCertificatePreview] certificateId=${certificateId} userId=${user._id}`);

  const certificate = await Certificate.findById(certificateId)
    .populate("studentId", "name email")
    .populate("courseId", "title");

  if (!certificate) {
    console.log(`[getCertificatePreview] Certificate not found: ${certificateId}`);
    throw new ApiError(404, "Certificate not found");
  }

  if (!certificate.studentId) {
    console.log(`[getCertificatePreview] Certificate ${certificateId} has no student (deleted user?)`);
    throw new ApiError(400, "Certificate owner no longer exists");
  }

  if (!certificate.studentId._id.equals(user._id)) {
    console.log(`[getCertificatePreview] User ${user._id} not authorized for certificate ${certificateId} owned by ${certificate.studentId._id}`);
    throw new ApiError(403, "You do not have permission to view this preview");
  }

  let svg = certificate.previewImage;
  console.log(`[getCertificatePreview] previewImage exists=${!!svg} length=${svg ? svg.length : 0}`);

  if (!svg) {
    const studentName = certificate.studentId?.name || "Student";
    const courseTitle = certificate.courseId?.title || "Course";
    console.log(`[getCertificatePreview] Generating fallback SVG for ${studentName} - ${courseTitle}`);
    svg = generateCertificateSvg(
      certificate,
      studentName,
      courseTitle,
      true,
    );
  }

  return {
    svg,
    certificateNumber: certificate.certificateNumber,
    issuedDate: certificate.issuedDate,
    studentName: certificate.studentId?.name,
    courseTitle: certificate.courseId?.title,
  };
};

export const requestDownload = async (user, certificateId) => {
  const certificate = await Certificate.findById(certificateId);

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  if (certificate.studentId.toString() !== user._id.toString()) {
    throw new ApiError(403, "You do not have permission to request download");
  }

  const existing = await CertificateDownloadRequest.findOne({
    student: user._id,
    certificate: certificateId,
    status: "PENDING",
  });

  if (existing) {
    throw new ApiError(409, "A download request is already pending");
  }

  const request = await CertificateDownloadRequest.create({
    student: user._id,
    certificate: certificateId,
    status: "PENDING",
  });

  import("../services/autoNotification.service.js")
    .then((m) =>
      m.notifyNewDownloadRequest({
        studentId: user._id,
        certificateId,
        requestId: request._id,
      }),
    )
    .catch(() => {});

  return { id: request._id, status: request.status };
};

export const getDownloadRequests = async (user) => {
  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "Only admins can view download requests");
  }

  const requests = await CertificateDownloadRequest.find()
    .populate("student", "name email")
    .populate({
      path: "certificate",
      populate: { path: "courseId", select: "title" },
    })
    .sort({ createdAt: -1 });

  return requests.map((r) => ({
    id: r._id,
    student: r.student
      ? { id: r.student._id, name: r.student.name, email: r.student.email }
      : null,
    certificate: r.certificate
      ? {
          id: r.certificate._id,
          certificateNumber: r.certificate.certificateNumber,
          courseTitle: r.certificate.courseId?.title,
        }
      : null,
    status: r.status,
    reviewedBy: r.reviewedBy,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
  }));
};

export const reviewDownloadRequest = async (user, requestId, action) => {
  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "Only admins can review download requests");
  }

  if (!["APPROVED", "REJECTED"].includes(action)) {
    throw new ApiError(400, "Action must be APPROVED or REJECTED");
  }

  const request = await CertificateDownloadRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Download request not found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(409, "This request has already been reviewed");
  }

  request.status = action;
  request.reviewedBy = user._id;
  request.reviewedAt = new Date();
  await request.save();

  if (action === "APPROVED") {
    import("../services/autoNotification.service.js")
      .then((m) => m.notifyDownloadApproved({ studentId: request.student, certificateId: request.certificate }))
      .catch(() => {});
  } else {
    import("../services/autoNotification.service.js")
      .then((m) => m.notifyDownloadRejected({ studentId: request.student, certificateId: request.certificate }))
      .catch(() => {});
  }

  return { id: request._id, status: request.status };
};

export const downloadCertificate = async (user, certificateId) => {
  console.log(`[downloadCertificate] certificateId=${certificateId} userId=${user._id}`);

  const certificate = await Certificate.findById(certificateId)
    .populate("studentId", "name email")
    .populate("courseId", "title");

  if (!certificate) {
    console.log(`[downloadCertificate] Certificate not found: ${certificateId}`);
    throw new ApiError(404, "Certificate not found");
  }

  if (!certificate.studentId) {
    console.log(`[downloadCertificate] Certificate ${certificateId} has no student (deleted user?)`);
    throw new ApiError(400, "Certificate owner no longer exists");
  }

  if (!certificate.studentId._id.equals(user._id)) {
    console.log(`[downloadCertificate] User ${user._id} not authorized for certificate ${certificateId} owned by ${certificate.studentId._id}`);
    throw new ApiError(403, "You do not have permission to download this certificate");
  }

  const request = await CertificateDownloadRequest.findOne({
    student: user._id,
    certificate: certificateId,
    status: "APPROVED",
  });

  if (!request) {
    throw new ApiError(403, "Download not approved. Request approval from an admin first.");
  }

  let svg = certificate.originalFile;
  console.log(`[downloadCertificate] originalFile exists=${!!svg} length=${svg ? svg.length : 0}`);

  if (!svg) {
    const studentName = certificate.studentId?.name || "Student";
    const courseTitle = certificate.courseId?.title || "Course";
    console.log(`[downloadCertificate] Generating fallback SVG for ${studentName} - ${courseTitle}`);
    svg = generateCertificateSvg(
      certificate,
      studentName,
      courseTitle,
      false,
    );
  }

  return { svg, filename: `certificate-${certificate.certificateNumber}.svg` };
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

  const certificateNumber = generateCertificateNumber();
  const verificationCode = generateVerificationCode();
  const issuedDate = new Date();

  const svgData = {
    certificateNumber,
    issuedDate,
    verificationCode,
  };

  const previewImage = generateCertificateSvg(
    svgData,
    student.name,
    course.title,
    true,
  );

  const originalFile = generateCertificateSvg(
    svgData,
    student.name,
    course.title,
    false,
  );

  const certificate = await Certificate.create({
    studentId: student._id,
    courseId: course._id,
    certificateNumber,
    issuedDate,
    issuedBy: issuer._id,
    pdfUrl: "",
    previewImage,
    originalFile,
    completedAt: new Date(),
    verificationCode,
  });

  import("../services/autoNotification.service.js")
    .then((m) => m.notifyCertificateIssued(certificate))
    .catch(() => {});
  import("../services/audit.service.js")
    .then((m) =>
      m.logAudit({
        user: issuer,
        action: "Issue",
        module: "Certificate",
        targetCollection: "Certificate",
        targetId: certificate._id,
        description: `Certificate issued to ${student.name} for ${course.title}`,
      }),
    )
    .catch(() => {});
  import("../services/activity.service.js")
    .then((m) =>
      m.logActivity({
        user: issuer,
        activityType: "certificate_issued",
        module: "Certificate",
        description: `Certificate issued to ${student.name}`,
        targetId: certificate._id,
        targetModel: "Certificate",
      }),
    )
    .catch(() => {});

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