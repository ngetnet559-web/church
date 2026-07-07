export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

export const NOTIFICATION_CATEGORIES = {
  COURSE: "Course",
  ATTENDANCE: "Attendance",
  CERTIFICATE: "Certificate",
  DONATION: "Donation",
  FINANCE: "Finance",
  MEMBER: "Member",
  EVENT: "Event",
  ANNOUNCEMENT: "Announcement",
  PROFILE: "Profile",
  SYSTEM: "System",
};

export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

export const ALL_NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPES);
export const ALL_NOTIFICATION_CATEGORIES = Object.values(NOTIFICATION_CATEGORIES);
export const ALL_NOTIFICATION_PRIORITIES = Object.values(NOTIFICATION_PRIORITIES);
