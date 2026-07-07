import { Megaphone, Pin, Calendar } from "lucide-react";

export default function AnnouncementCard({ announcement }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 ${announcement.isPinned ? "border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-200 dark:ring-indigo-800" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${announcement.isPinned ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
            <Megaphone size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {announcement.title}
              </h3>
              {announcement.isPinned && (
                <Pin size={14} className="text-indigo-500" />
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {announcement.description}
            </p>
          </div>
        </div>
      </div>

      {announcement.content && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {announcement.content}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(announcement.publishDate).toLocaleDateString()}
        </span>
        {announcement.createdBy?.name && (
          <span>By {announcement.createdBy.name}</span>
        )}
        {announcement.targetRoles?.length > 0 && announcement.targetRoles.length < 5 && (
          <span className="flex gap-1">
            {announcement.targetRoles.map((role) => (
              <span key={role} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {role}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
