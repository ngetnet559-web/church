export default function DashboardSection({
  title,
  children,
}) {
  return (
    <div className="space-y-4">

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-colors dark:border-gray-700 dark:bg-gray-900">

        {children}

      </div>

    </div>
  );
}