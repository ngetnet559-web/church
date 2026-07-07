export default function NotificationSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-1/3 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="h-3 w-12 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="h-3 w-2/3 rounded bg-gray-300 dark:bg-gray-600" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-5 w-14 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
