import { useState, useCallback } from "react";
import { notificationService } from "../../services/notification.service";
import UnreadIndicator from "./UnreadIndicator";

const TYPE_STYLES = {
  info: "border-l-indigo-500",
  success: "border-l-green-500",
  warning: "border-l-yellow-500",
  error: "border-l-red-500",
};

const PRIORITY_COLORS = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  normal: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
  high: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const markAsRead = useCallback(async () => {
    if (notification.isRead) return;
    try {
      await notificationService.markAsRead(notification._id);
      onMarkRead?.(notification._id);
    } catch {
      // silent
    }
  }, [notification._id, notification.isRead, onMarkRead]);

  async function handleCardClick() {
    if (isDeleting) return;
    await markAsRead();
    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  async function handleMarkReadClick(e) {
    e.stopPropagation();
    await markAsRead();
  }

  async function handleDeleteClick(e) {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await notificationService.deleteNotification(notification._id);
      onDelete?.(notification._id);
    } catch {
      setIsDeleting(false);
    }
  }

  function handleViewLinkClick(e) {
    e.stopPropagation();
    markAsRead();
  }

  return (
    <div
      onClick={handleCardClick}
      className={`relative cursor-pointer border-l-4 ${TYPE_STYLES[notification.type] || "border-l-indigo-500"} rounded-2xl p-4 shadow-lg transition-all hover:shadow-xl ${
        notification.isRead
          ? "bg-white dark:bg-gray-800"
          : "bg-blue-50 dark:bg-blue-900/20"
      } ${isDeleting ? "animate-pulse opacity-30" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <UnreadIndicator isRead={notification.isRead} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold ${notification.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
              {notification.title}
            </h4>
            <span className="shrink-0 text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>
          </div>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {notification.message}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {notification.category && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {notification.category}
              </span>
            )}
            {notification.priority && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.normal}`}>
                {notification.priority}
              </span>
            )}
            {notification.link && (
              <a
                href={notification.link}
                onClick={handleViewLinkClick}
                className="ml-auto text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-2 dark:border-gray-700">
        {!notification.isRead && (
          <button
            onClick={handleMarkReadClick}
            className="rounded-lg px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            Mark Read
          </button>
        )}
        <button
          onClick={handleDeleteClick}
          className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
