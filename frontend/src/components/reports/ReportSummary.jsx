export default function ReportSummary({ summary }) {
  if (!summary || Object.keys(summary).length === 0) return null;

  const displayItems = Object.entries(summary).filter(
    ([, v]) => typeof v === "number" || typeof v === "string"
  );

  if (displayItems.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {displayItems.map(([key, val]) => (
        <div key={key} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
          </p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {typeof val === "number" ? val.toLocaleString() : val}
          </p>
        </div>
      ))}
    </div>
  );
}
