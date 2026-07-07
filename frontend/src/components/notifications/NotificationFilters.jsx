const CATEGORIES = [
  "",
  "Course",
  "Attendance",
  "Certificate",
  "Donation",
  "Finance",
  "Member",
  "Event",
  "Announcement",
  "Profile",
  "System",
];

const PRIORITIES = ["", "low", "normal", "high", "urgent"];

export default function NotificationFilters({ filters, onChange }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search notifications..."
        value={filters.search || ""}
        onChange={(e) => handleChange("search", e.target.value)}
        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
      />

      <select
        value={filters.category || ""}
        onChange={(e) => handleChange("category", e.target.value)}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">All Categories</option>
        {CATEGORIES.filter(Boolean).map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.priority || ""}
        onChange={(e) => handleChange("priority", e.target.value)}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">All Priorities</option>
        {PRIORITIES.filter(Boolean).map((p) => (
          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
        ))}
      </select>

      <select
        value={filters.isRead === undefined ? "" : filters.isRead ? "read" : "unread"}
        onChange={(e) => {
          const val = e.target.value;
          handleChange("isRead", val === "" ? undefined : val === "read");
        }}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">All Status</option>
        <option value="unread">Unread</option>
        <option value="read">Read</option>
      </select>
    </div>
  );
}
