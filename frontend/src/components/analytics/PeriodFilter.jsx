const periods = [
  "all",
  "today",
  "week",
  "month",
  "year",
];

export default function PeriodFilter({
  period,
  onChange,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-4 py-2 rounded-xl transition ${
            period === item
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {item.charAt(0).toUpperCase() +
            item.slice(1)}
        </button>
      ))}
    </div>
  );
}