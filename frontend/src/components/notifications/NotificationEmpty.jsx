import { Bell } from "lucide-react";

export default function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 dark:bg-gray-800">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
        <Bell size={32} className="text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        No notifications
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        You're all caught up!
      </p>
    </div>
  );
}
