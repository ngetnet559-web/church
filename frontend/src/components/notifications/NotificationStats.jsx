import { useMemo } from "react";
import { Bell, CheckCheck, AlertTriangle, Info, XCircle, Trash2, RefreshCw } from "lucide-react";

const categoryIcons = {
  System: Bell,
  Course: Info,
  Attendance: CheckCheck,
  Donation: AlertTriangle,
  Finance: AlertTriangle,
  Certificate: Info,
  Profile: Info,
  Announcement: Bell,
  Event: Info,
  Member: Info,
};

const categoryColors = {
  System: "text-gray-600 dark:text-gray-400",
  Course: "text-indigo-600 dark:text-indigo-400",
  Attendance: "text-green-600 dark:text-green-400",
  Donation: "text-red-600 dark:text-red-400",
  Finance: "text-yellow-600 dark:text-yellow-400",
  Certificate: "text-amber-600 dark:text-amber-400",
  Profile: "text-blue-600 dark:text-blue-400",
  Announcement: "text-purple-600 dark:text-purple-400",
  Event: "text-cyan-600 dark:text-cyan-400",
  Member: "text-teal-600 dark:text-teal-400",
};

export default function NotificationStats({ stats, loading, onClearAll, onRefresh }) {
  const total = stats?.total || 0;
  const unreadPct = stats?.unreadPercentage || 0;
  const readPct = stats?.readPercentage || 0;

  const gaugeColor = useMemo(() => {
    if (unreadPct >= 50) return "bg-red-500";
    if (unreadPct >= 25) return "bg-yellow-500";
    return "bg-green-500";
  }, [unreadPct]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 dark:bg-gray-800">
              <div className="mb-2 h-4 w-16 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-8 w-12 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-4 dark:bg-gray-800">
          <div className="mb-3 h-4 w-24 rounded bg-gray-300 dark:bg-gray-600" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-full rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
            <Bell size={20} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread</p>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.unread || 0}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Read</p>
            <CheckCheck size={20} className="text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.read || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Read / Unread Ratio</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {readPct}% read &middot; {unreadPct}% unread
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${gaugeColor}`}
            style={{ width: `${readPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">By Category</h3>
          {stats?.byCategory?.length > 0 ? (
            <div className="space-y-2">
              {stats.byCategory.map((cat) => {
                const Icon = categoryIcons[cat._id] || Bell;
                const color = categoryColors[cat._id] || "text-gray-500";
                const pct = total === 0 ? 0 : Math.round((cat.count / total) * 100);
                return (
                  <div key={cat._id} className="flex items-center gap-3">
                    <Icon size={14} className={color} />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{cat._id || "Other"}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.count}</span>
                    <span className="w-10 text-right text-xs text-gray-400">{pct}%</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">By Priority</h3>
          {stats?.byPriority?.length > 0 ? (
            <div className="space-y-2">
              {stats.byPriority.map((p) => (
                <div key={p._id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm capitalize text-gray-700 dark:text-gray-300">
                    {p._id === "high" && <AlertTriangle size={14} className="text-red-500" />}
                    {p._id === "normal" && <Info size={14} className="text-blue-500" />}
                    {p._id === "low" && <Info size={14} className="text-gray-400" />}
                    {p._id}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Notifications</h3>
        {stats?.recent?.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats.recent.map((n) => (
              <div key={n._id} className="flex items-start gap-3 py-2.5">
                <div className={`mt-0.5 shrink-0 ${n.isRead ? "opacity-0" : ""}`}>
                  <span className="block h-2 w-2 rounded-full bg-indigo-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${n.isRead ? "text-gray-500 dark:text-gray-400" : "font-medium text-gray-900 dark:text-white"}`}>
                    {n.title}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">{n.message}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">No recent notifications</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
        >
          <Trash2 size={16} />
          Clear All Notifications
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}
