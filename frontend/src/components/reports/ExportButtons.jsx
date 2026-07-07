import { useState } from "react";
import { FileDown, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { reportService } from "../../services/report.service";

export default function ExportButtons({ reportType, filters }) {
  const [exporting, setExporting] = useState(null);

  async function handleExport(format) {
    setExporting(format);
    try {
      const params = { ...filters };
      if (params._showRole) delete params._showRole;
      if (params._showCourse) delete params._showCourse;
      if (params._showCampaign) delete params._showCampaign;
      if (params._showStatus) delete params._showStatus;
      if (params._showCategory) delete params._showCategory;
      if (params._showPayment) delete params._showPayment;
      if (params._showGender) delete params._showGender;
      if (params._showCompletion) delete params._showCompletion;

      let res;
      if (format === "csv") {
        res = await reportService.exportCSV(reportType, params);
      } else if (format === "excel") {
        res = await reportService.exportExcel(reportType, params);
      } else if (format === "pdf") {
        res = await reportService.exportPDF(reportType, params);
      }

      const blob = res instanceof Blob ? res : new Blob([res], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_report.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setExporting(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        onClick={() => handleExport("csv")}
        disabled={exporting === "csv"}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FileDown size={16} />
        {exporting === "csv" ? "Exporting..." : "CSV"}
      </button>
      <button
        onClick={() => handleExport("excel")}
        disabled={exporting === "excel"}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FileSpreadsheet size={16} />
        {exporting === "excel" ? "Exporting..." : "Excel"}
      </button>
      <button
        onClick={() => handleExport("pdf")}
        disabled={exporting === "pdf"}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FileText size={16} />
        {exporting === "pdf" ? "Exporting..." : "PDF"}
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <Printer size={16} />
        Print
      </button>
    </div>
  );
}
