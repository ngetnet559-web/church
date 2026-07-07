import { RefreshCw, Download, FileSpreadsheet, FileText } from "lucide-react";

export default function AnalyticsHeader({
  title,
  onRefresh,
  onExportPDF,
  onExportExcel,
  onExportCSV,
  loading,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Platform overview and insights
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <FileText size={16} />
          PDF
        </button>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <FileSpreadsheet size={16} />
          Excel
        </button>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Download size={16} />
          CSV
        </button>
      </div>
    </div>
  );
}
