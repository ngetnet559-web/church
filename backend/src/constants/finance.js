export const DONATION_TYPES = [
  "General",
  "Building",
  "Mission",
  "Children",
  "Charity",
  "Education",
  "Equipment",
  "Emergency",
  "Event",
  "Other",
];

export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Stripe",
  "PayPal",
  "Chapa",
  "Telebirr",
  "CBE Birr",
  "Other",
];

export const PAYMENT_STATUS = ["Pending", "Paid", "Failed", "Refunded"];

export const EXPENSE_CATEGORIES = [
  "Utilities",
  "Teaching Materials",
  "Maintenance",
  "Equipment",
  "Salary",
  "Transport",
  "Internet",
  "Food",
  "Charity",
  "Event",
  "Mission",
  "Emergency",
  "Other",
];

export const EXPENSE_STATUS = ["Pending", "Approved", "Rejected"];

export const AUDIT_ACTIONS = {
  DONATION_CREATED: "Donation Created",
  DONATION_UPDATED: "Donation Updated",
  DONATION_DELETED: "Donation Deleted",
  DONATION_RESTORED: "Donation Restored",
  DONATION_REFUNDED: "Donation Refunded",
  CAMPAIGN_CREATED: "Campaign Created",
  CAMPAIGN_UPDATED: "Campaign Updated",
  CAMPAIGN_CLOSED: "Campaign Closed",
  CAMPAIGN_DELETED: "Campaign Deleted",
  EXPENSE_CREATED: "Expense Created",
  EXPENSE_APPROVED: "Expense Approved",
  EXPENSE_DELETED: "Expense Deleted",
  BUDGET_CREATED: "Budget Created",
  BUDGET_UPDATED: "Budget Updated",
  BUDGET_DELETED: "Budget Deleted",
};

export const FINANCE_ROLES = {
  MANAGE: ["SUPER_ADMIN", "ADMIN"],
  READ_CAMPAIGNS: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  DONATE: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
  VIEW_OWN: ["STUDENT", "PARENT"],
};
