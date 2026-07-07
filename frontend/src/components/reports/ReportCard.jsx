export default function ReportCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {Icon && <Icon size={20} className={color || "text-indigo-500"} />}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      )}
    </button>
  );
}
