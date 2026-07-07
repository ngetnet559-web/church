export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 rounded bg-gray-300 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-40 rounded bg-gray-300 dark:bg-gray-700" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="mt-4 h-10 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="h-6 w-40 rounded bg-gray-300 dark:bg-gray-700" />
        <div className="mt-4 h-80 rounded bg-gray-300 dark:bg-gray-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="h-6 w-40 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="mt-4 h-80 rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="h-6 w-48 rounded bg-gray-300 dark:bg-gray-700" />
        <div className="mt-4 h-80 rounded bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  );
}
