export default function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      className="
      rounded-2xl
      bg-white
      dark:bg-gray-800
      shadow-lg
      p-6
      transition
      hover:scale-105
      hover:shadow-xl
    "
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
            {value}
          </h2>
        </div>

        <div className="text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      </div>
    </div>
  );
}