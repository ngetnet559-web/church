const periods = ["all", "today", "week", "month", "year"];

export default function AnalyticsFilters({ period, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Period:
      </span>
      {periods.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            period === item
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </button>
      ))}
    </div>
  );
}
