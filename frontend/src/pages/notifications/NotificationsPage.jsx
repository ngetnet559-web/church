import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notification.service";
import { ROLES } from "../../constants/roles";
import NotificationList from "../../components/notifications/NotificationList";
import NotificationFilters from "../../components/notifications/NotificationFilters";
import { Bell, CheckCheck, RefreshCw, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, unreadCount: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    isRead: undefined,
    category: "",
    priority: "",
    search: "",
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(filters);
      setNotifications(res.data?.notifications || []);
      setPagination({
        page: res.data?.page || 1,
        totalPages: res.data?.totalPages || 1,
        total: res.data?.total || 0,
        unreadCount: res.data?.unreadCount || 0,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch {
      // silent
    }
  }

  async function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    loadNotifications();
  }

  async function handleDelete(id) {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    loadNotifications();
  }

  function goToPage(page) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {pagination.unreadCount} unread · {pagination.total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
          <button
            onClick={loadNotifications}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/dashboard/notifications/settings"
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </div>

      <NotificationFilters filters={filters} onChange={handleFilterChange} />

      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
