import AnnouncementCard from "./AnnouncementCard";
import NotificationEmpty from "./NotificationEmpty";
import NotificationSkeleton from "./NotificationSkeleton";

export default function AnnouncementList({ announcements, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return <NotificationEmpty />;
  }

  const pinned = announcements.filter((a) => a.isPinned);
  const unpinned = announcements.filter((a) => !a.isPinned);

  return (
    <div className="space-y-4">
      {pinned.map((a) => (
        <AnnouncementCard key={a._id} announcement={a} />
      ))}
      {unpinned.map((a) => (
        <AnnouncementCard key={a._id} announcement={a} />
      ))}
    </div>
  );
}
