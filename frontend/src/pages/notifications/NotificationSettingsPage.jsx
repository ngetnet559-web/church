import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../../services/notification.service";
import NotificationStats from "../../components/notifications/NotificationStats";
import { Settings, Trash2 } from "lucide-react";

export default function NotificationSettingsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotificationStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || "Failed to load notification stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function handleClearAll() {
    if (!window.confirm("Are you sure you want to clear all notifications? This cannot be undone.")) {
      return;
    }
    setClearing(true);
    try {
      await notificationService.clearAllNotifications();
      setStats(null);
      loadStats();
    } catch (err) {
      setError(err.message || "Failed to clear notifications");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View notification statistics and manage your notifications
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
          <button onClick={loadStats} className="ml-2 underline">Retry</button>
        </div>
      )}

      <NotificationStats
        stats={stats}
        loading={loading}
        onClearAll={handleClearAll}
        onRefresh={loadStats}
      />
    </div>
  );
}
