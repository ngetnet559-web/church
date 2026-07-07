import { createNotification } from "./notification.service.js";
import { ROLES } from "../constants/roles.js";
import emailService from "./email.service.js";

const notifyAdmins = async (title, message, metadata = {}) => {
  const User = (await import("../models/User.js")).default;
  const admins = await User.find({
    role: { $in: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
    isActive: true,
  }).select("_id");

  return Promise.all(
    admins.map((admin) =>
      createNotification({
        recipient: admin._id,
        title,
        message,
        type: "info",
        category: "System",
        priority: "normal",
        ...metadata,
      })
    )
  );
};

const notifyUser = async (userId, title, message, options = {}) => {
  return createNotification({
    recipient: userId,
    title,
    message,
    type: options.type || "info",
    category: options.category || "System",
    priority: options.priority || "normal",
    icon: options.icon || "",
    color: options.color || "",
    link: options.link || "",
    metadata: options.metadata || {},
  });
};

export const notifyUserRegistered = async (user) => {
  await notifyAdmins("New User Registered", `${user.name} (${user.email}) has registered as ${user.role}.`, {
    category: "Member",
    icon: "user-plus",
    color: "#22c55e",
    link: "/dashboard/users",
    metadata: { userId: user._id.toString() },
  });

  await notifyUser(
    user._id,
    "Welcome aboard!",
    `Welcome ${user.name}! Your account has been created successfully.`,
    { type: "success", category: "Profile", icon: "hand-wave", color: "#22c55e", link: "/dashboard/profile" }
  );

  try {
    await emailService.sendWelcomeEmail(user);
  } catch {
    // non-blocking
  }
};

export const notifyCourseCreated = async (course, creator) => {
  await notifyAdmins("New Course Created", `"${course.title}" was created by ${creator.name}.`, {
    category: "Course",
    icon: "book-plus",
    color: "#6366f1",
    link: `/dashboard/courses/${course._id}`,
    metadata: { courseId: course._id.toString() },
  });
};

export const notifyLessonAdded = async (lesson, course) => {
  const User = (await import("../models/User.js")).default;
  const Enrollment = (await import("../models/Enrollment.js")).default;

  const enrollments = await Enrollment.find({ courseId: course._id }).populate("userId", "_id");
  const studentIds = enrollments.map((e) => e.userId._id);

  if (studentIds.length > 0) {
    const title = `New Lesson: ${lesson.title}`;
    const message = `A new lesson "${lesson.title}" has been added to "${course.title}".`;

    await Promise.all(
      studentIds.map((studentId) =>
        createNotification({
          recipient: studentId,
          title,
          message,
          type: "info",
          category: "Course",
          priority: "normal",
          icon: "book-open",
          color: "#6366f1",
          link: `/dashboard/courses/${course._id}`,
          metadata: { courseId: course._id.toString(), lessonId: lesson._id.toString() },
        })
      )
    );
  }
};

export const notifyStudentEnrolled = async (enrollment) => {
  const user = await (await import("../models/User.js")).default.findById(enrollment.userId).select("name email");
  const course = await (await import("../models/Course.js")).default.findById(enrollment.courseId).select("title createdBy");

  if (user) {
    await notifyUser(
      user._id,
      "Course Enrollment",
      `You have successfully enrolled in "${course?.title || "the course"}".`,
      {
        type: "success",
        category: "Course",
        icon: "graduation-cap",
        color: "#22c55e",
        link: `/dashboard/courses/${enrollment.courseId}`,
        metadata: { courseId: enrollment.courseId.toString(), enrollmentId: enrollment._id.toString() },
      }
    );
  }

  if (course?.createdBy) {
    await notifyUser(
      course.createdBy,
      "New Enrollment",
      `${user?.name || "A student"} has enrolled in "${course.title}".`,
      {
        category: "Course",
        icon: "user-plus",
        color: "#6366f1",
        link: `/dashboard/courses/${enrollment.courseId}`,
        metadata: { courseId: enrollment.courseId.toString(), enrollmentId: enrollment._id.toString() },
      }
    );
  }
};

export const notifyCourseCompleted = async (enrollment) => {
  const user = await (await import("../models/User.js")).default.findById(enrollment.userId).select("name");
  const course = await (await import("../models/Course.js")).default.findById(enrollment.courseId).select("title");

  if (user) {
    await notifyUser(
      user._id,
      "Course Completed!",
      `Congratulations! You have completed "${course?.title || "the course"}".`,
      {
        type: "success",
        category: "Course",
        icon: "badge-check",
        color: "#22c55e",
        link: `/dashboard/certificates`,
        metadata: { courseId: enrollment.courseId.toString() },
      }
    );
  }
};

export const notifyCertificateIssued = async (certificate) => {
  const user = await (await import("../models/User.js")).default.findById(certificate.studentId).select("name email _id");
  const course = await (await import("../models/Course.js")).default.findById(certificate.courseId).select("title");

  if (user) {
    await notifyUser(
      user._id,
      "Certificate Issued",
      `Your certificate for "${course?.title || "the course"}" is ready. Certificate #${certificate.certificateNumber}.`,
      {
        type: "success",
        category: "Certificate",
        icon: "award",
        color: "#f59e0b",
        link: `/dashboard/certificates/${certificate._id}`,
        metadata: { certificateId: certificate._id.toString() },
      }
    );

    try {
      await emailService.sendCertificateEmail(user, certificate);
    } catch {
      // non-blocking
    }
  }
};

export const notifyAttendanceMarked = async (attendance) => {
  const Enrollment = (await import("../models/Enrollment.js")).default;
  const enrollment = await Enrollment.findById(attendance.enrollmentId).populate("userId", "_id name");

  if (enrollment?.userId) {
    await notifyUser(
      enrollment.userId._id,
      "Attendance Recorded",
      `Your attendance has been marked for the session.`,
      {
        type: "success",
        category: "Attendance",
        icon: "check-circle",
        color: "#22c55e",
        link: "/dashboard/my-attendance",
        metadata: { attendanceId: attendance._id.toString() },
      }
    );
  }
};

export const notifyAttendanceReminder = async (studentId, session) => {
  await notifyUser(
    studentId,
    "Attendance Reminder",
    `Don't forget to mark your attendance for the upcoming session.`,
    {
      type: "warning",
      category: "Attendance",
      priority: "high",
      icon: "clock",
      color: "#f59e0b",
      link: "/dashboard/my-attendance",
      metadata: { sessionId: session?._id?.toString() },
    }
  );

  try {
    const user = await (await import("../models/User.js")).default.findById(studentId).select("email");
    if (user) {
      await emailService.sendAttendanceReminder(user, session);
    }
  } catch {
    // non-blocking
  }
};

export const notifyDonationReceived = async (donation) => {
  await notifyAdmins("Donation Received", `A donation of $${donation.amount?.toFixed(2)} was received from ${donation.donorName}.`, {
    category: "Donation",
    icon: "heart",
    color: "#ef4444",
    link: "/dashboard/finance/donations",
    metadata: { donationId: donation._id.toString() },
  });
};

export const notifyDonationApproved = async (donation) => {
  await notifyAdmins("Donation Approved", `Donation of $${donation.amount?.toFixed(2)} from ${donation.donorName} has been approved.`, {
    type: "success",
    category: "Donation",
    icon: "badge-check",
    color: "#22c55e",
    link: `/dashboard/finance/donations/${donation._id}`,
    metadata: { donationId: donation._id.toString() },
  });
};

export const notifyExpenseApproved = async (expense) => {
  await notifyAdmins("Expense Approved", `Expense "${expense.title}" of $${expense.amount?.toFixed(2)} has been approved.`, {
    type: "success",
    category: "Finance",
    icon: "wallet",
    color: "#22c55e",
    link: `/dashboard/finance/expenses/${expense._id}`,
    metadata: { expenseId: expense._id.toString() },
  });
};

export const notifyCampaignCreated = async (campaign, creator) => {
  const User = (await import("../models/User.js")).default;
  const allUsers = await User.find({ isActive: true }).select("_id");

  await Promise.all(
    allUsers.map((user) =>
      createNotification({
        recipient: user._id,
        title: "New Campaign",
        message: `A new campaign "${campaign.title}" has been launched.`,
        type: "info",
        category: "Donation",
        priority: "normal",
        icon: "target",
        color: "#6366f1",
        link: "/dashboard/finance/campaigns",
        metadata: { campaignId: campaign._id.toString() },
      })
    )
  );
};

export const notifyCampaignCompleted = async (campaign) => {
  const User = (await import("../models/User.js")).default;
  const allUsers = await User.find({ isActive: true }).select("_id");

  await Promise.all(
    allUsers.map((user) =>
      createNotification({
        recipient: user._id,
        title: "Campaign Completed",
        message: `Campaign "${campaign.title}" has reached its goal!`,
        type: "success",
        category: "Donation",
        priority: "high",
        icon: "trophy",
        color: "#22c55e",
        link: "/dashboard/finance/campaigns",
        metadata: { campaignId: campaign._id.toString() },
      })
    )
  );
};

export const notifyProfileUpdated = async (profile) => {
  const user = await (await import("../models/User.js")).default.findById(profile.userId).select("_id name");

  if (user) {
    await notifyUser(
      user._id,
      "Profile Updated",
      "Your member profile has been updated successfully.",
      {
        type: "success",
        category: "Profile",
        icon: "user-check",
        color: "#22c55e",
        link: "/dashboard/profile",
        metadata: { profileId: profile._id.toString() },
      }
    );
  }
};

export const notifyBadgeEarned = async (userId, badge) => {
  await notifyUser(
    userId,
    "Badge Earned!",
    `You earned the "${badge.name || "New Badge"}" badge!`,
    {
      type: "success",
      category: "Profile",
      priority: "high",
      icon: "award",
      color: "#f59e0b",
      link: "/dashboard/profile",
      metadata: { badge },
    }
  );
};

export const notifyAchievementEarned = async (userId, achievement) => {
  await notifyUser(
    userId,
    "Achievement Unlocked!",
    `Congratulations! You unlocked "${achievement.title || "New Achievement"}".`,
    {
      type: "success",
      category: "Profile",
      priority: "high",
      icon: "trophy",
      color: "#f59e0b",
      link: "/dashboard/profile",
      metadata: { achievementId: achievement._id?.toString() },
    }
  );
};

export const notifyAdminAnnouncement = async (title, message, createdBy) => {
  const User = (await import("../models/User.js")).default;
  const allUsers = await User.find({ isActive: true }).select("_id");

  await Promise.all(
    allUsers.map((user) =>
      createNotification({
        recipient: user._id,
        sender: createdBy,
        title,
        message,
        type: "info",
        category: "Announcement",
        priority: "high",
        icon: "megaphone",
        color: "#6366f1",
        link: "/dashboard/announcements",
        metadata: {},
      })
    )
  );
};

export const notifyNewDownloadRequest = async ({ studentId, certificateId, requestId }) => {
  const student = await (await import("../models/User.js")).default.findById(studentId).select("name");
  const cert = await (await import("../models/Certificate.js")).default.findById(certificateId).populate("courseId", "title");

  await notifyAdmins("Certificate Download Request", `${student?.name || "A student"} requested to download certificate for "${cert?.courseId?.title || "a course"}".`, {
    category: "Certificate",
    icon: "file-down",
    color: "#6366f1",
    link: "/dashboard/certificates/download-requests",
    metadata: { requestId: requestId?.toString(), certificateId: certificateId?.toString() },
  });
};

export const notifyDownloadApproved = async ({ studentId, certificateId }) => {
  const cert = await (await import("../models/Certificate.js")).default.findById(certificateId).populate("courseId", "title");

  await notifyUser(
    studentId,
    "Download Approved",
    `Your download request for "${cert?.courseId?.title || "the certificate"}" has been approved. You can now download your certificate.`,
    {
      type: "success",
      category: "Certificate",
      icon: "file-down",
      color: "#22c55e",
      link: `/dashboard/certificates/${certificateId}`,
      metadata: { certificateId: certificateId?.toString() },
    }
  );
};

export const notifyDownloadRejected = async ({ studentId, certificateId }) => {
  const cert = await (await import("../models/Certificate.js")).default.findById(certificateId).populate("courseId", "title");

  await notifyUser(
    studentId,
    "Download Request Rejected",
    `Your download request for "${cert?.courseId?.title || "the certificate"}" has been rejected. Please contact administration for more information.`,
    {
      type: "error",
      category: "Certificate",
      icon: "file-x",
      color: "#ef4444",
      link: `/dashboard/certificates/${certificateId}`,
      metadata: { certificateId: certificateId?.toString() },
    }
  );
};
