import { Search, Filter, X } from "lucide-react";
import DateRangePicker from "./DateRangePicker";

export default function ReportFilters({ filters, onChange, roles, courses, campaigns, statuses, categories, paymentMethods, genders }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const showGender = filters._showGender;
  const showCourse = filters._showCourse;
  const showCampaign = filters._showCampaign;
  const showStatus = filters._showStatus;
  const showCategory = filters._showCategory;
  const showPayment = filters._showPayment;
  const showRole = filters._showRole;
  const showCompletion = filters._showCompletion;

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
        {(filters.dateRange || filters.search) && (
          <button
            onClick={() => onChange({})}
            className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <DateRangePicker
        value={filters.dateRange || ""}
        onChange={(v) => set("dateRange", v)}
        startDate={filters.startDate || ""}
        endDate={filters.endDate || ""}
        onStartChange={(v) => set("startDate", v)}
        onEndChange={(v) => set("endDate", v)}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ""}
            onChange={(e) => set("search", e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {showRole && roles && (
          <select value={filters.role || ""} onChange={(e) => set("role", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}

        {showCourse && courses && (
          <select value={filters.courseId || ""} onChange={(e) => set("courseId", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        )}

        {showCampaign && campaigns && (
          <select value={filters.campaignId || ""} onChange={(e) => set("campaignId", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Campaigns</option>
            {campaigns.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        )}

        {showStatus && statuses && (
          <select value={filters.status || ""} onChange={(e) => set("status", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {showGender && genders && (
          <select value={filters.gender || ""} onChange={(e) => set("gender", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Genders</option>
            {genders.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        )}

        {showCategory && categories && (
          <select value={filters.category || ""} onChange={(e) => set("category", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {showPayment && paymentMethods && (
          <select value={filters.paymentMethod || ""} onChange={(e) => set("paymentMethod", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Methods</option>
            {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        )}

        {showCompletion && (
          <select value={filters.completion || ""} onChange={(e) => set("completion", e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Progress</option>
            <option value="completed">Completed</option>
            <option value="inProgress">In Progress</option>
          </select>
        )}
      </div>
    </div>
  );
}
