import { FileText, FileSpreadsheet, Download } from "lucide-react";

export default function AnalyticsExportButtons({
  onExportPDF,
  onExportExcel,
  onExportCSV,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onExportPDF}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <FileText size={16} />
        PDF
      </button>
      <button
        onClick={onExportExcel}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
      <button
        onClick={onExportCSV}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <Download size={16} />
        CSV
      </button>
    </div>
  );
}
