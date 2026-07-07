import { useState, useEffect, useCallback } from "react";
import { Activity, User, Mail, Calendar, Clock } from "lucide-react";
import { reportService } from "../../services/report.service";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportTable from "../../components/reports/ReportTable";
import ReportSummary from "../../components/reports/ReportSummary";
import ReportChart from "../../components/reports/ReportChart";
import ExportButtons from "../../components/reports/ExportButtons";
import ReportSkeleton from "../../components/reports/ReportSkeleton";
import EmptyReport from "../../components/reports/EmptyReport";

const STATUSES = ["Present", "Late", "Absent", "Excused"];
const INITIAL_FILTERS = { _showStatus: true };
const COLUMNS = [
  { key: "student", label: "Student" },
  { key: "email", label: "Email" },
  { key: "session", label: "Session" },
  { key: "status", label: "Status" },
  { key: "checkInTime", label: "Check-In Time" },
];

export default function AttendanceReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { _showStatus, ...apiFilters } = filters;
      const res = await reportService.getReport("attendance", apiFilters);
      setReportData(res.data);
    } catch (err) {
      setError(err?.message || "Failed to load attendance report");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = reportData?.summary;
  const rows = reportData?.rows || reportData?.data || [];
  const charts = reportData?.charts;

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Report</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Session attendance and trends
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <Activity size={48} className="mb-4 text-red-400" />
          <p className="text-lg font-medium text-red-500">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <Activity size={24} className="mr-2 inline-block text-yellow-500" />
            Attendance Report
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Session attendance and trends
          </p>
        </div>
        <ExportButtons reportType="attendance" filters={filters} />
      </div>

      <ReportFilters filters={filters} onChange={setFilters} statuses={STATUSES} />

      {loading ? (
        <ReportSkeleton rows={5} />
      ) : !reportData || (!summary && rows.length === 0) ? (
        <EmptyReport message="No attendance data available" onReset={() => setFilters(INITIAL_FILTERS)} />
      ) : (
        <>
          {summary && <ReportSummary summary={summary} />}

          {summary?.trend && (
            <ReportChart
              data={summary.trend}
              type="line"
              dataKey="present"
              nameKey="label"
              title="Attendance Trend"
            />
          )}

          {charts?.statusDistribution && (
            <ReportChart
              data={charts.statusDistribution}
              type="pie"
              dataKey="count"
              nameKey="_id"
              title="Attendance Status Breakdown"
            />
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={16} className="mr-1 inline-block" />
              Attendance Records
            </h3>
            <ReportTable columns={COLUMNS} rows={rows} />
          </div>
        </>
      )}
    </div>
  );
}
