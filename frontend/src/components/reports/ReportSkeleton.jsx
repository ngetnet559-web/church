export default function ReportSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white p-4 dark:bg-gray-800">
            <div className="mb-2 h-3 w-20 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="h-7 w-16 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
      ))}
    </div>
  );
}
