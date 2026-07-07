import { FileText } from "lucide-react";

export default function EmptyReport({ message, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
        {message || "No data available for this report"}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
