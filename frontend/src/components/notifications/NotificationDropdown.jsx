import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/notification.service";
import NotificationList from "./NotificationList";

export default function NotificationDropdown({ onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      try {
        const res = await notificationService.getUnreadNotifications(5);
        if (!cancelled) {
          setNotifications(res.data || []);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      onCountChange?.();
    } catch {
      // silent
    }
  }

  function handleMarkRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    onCountChange?.();
  }

  async function handleDelete(id) {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    onCountChange?.();
  }

  function handleViewAll() {
    onClose();
    navigate("/dashboard/notifications");
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-4">
        <NotificationList
          notifications={notifications}
          loading={loading}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      </div>

      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <button
          onClick={handleViewAll}
          className="w-full rounded-xl bg-indigo-50 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}
