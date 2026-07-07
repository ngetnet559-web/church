import NotificationCard from "./NotificationCard";
import NotificationEmpty from "./NotificationEmpty";
import NotificationSkeleton from "./NotificationSkeleton";

export default function NotificationList({ notifications, loading, onMarkRead, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return <NotificationEmpty />;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification._id}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
