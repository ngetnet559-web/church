import { useState, useEffect, useCallback } from "react";
import { BookOpen, User, Layers, Users, Target, Calendar } from "lucide-react";
import { reportService } from "../../services/report.service";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportTable from "../../components/reports/ReportTable";
import ReportSummary from "../../components/reports/ReportSummary";
import ReportChart from "../../components/reports/ReportChart";
import ExportButtons from "../../components/reports/ExportButtons";
import ReportSkeleton from "../../components/reports/ReportSkeleton";
import EmptyReport from "../../components/reports/EmptyReport";

const INITIAL_FILTERS = { _showStatus: true };
const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "createdBy", label: "Created By" },
  { key: "lessonCount", label: "Lessons" },
  { key: "enrollmentCount", label: "Enrollments" },
  { key: "completionRate", label: "Completion Rate" },
  { key: "createdAt", label: "Created" },
];

export default function CoursesReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { _showStatus, ...apiFilters } = filters;
      const res = await reportService.getReport("courses", apiFilters);
      setReportData(res.data);
    } catch (err) {
      setError(err?.message || "Failed to load courses report");
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses Report</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Course overview, lessons, and enrollments
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen size={48} className="mb-4 text-red-400" />
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
            <BookOpen size={24} className="mr-2 inline-block text-purple-500" />
            Courses Report
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Course overview, lessons, and enrollments
          </p>
        </div>
        <ExportButtons reportType="courses" filters={filters} />
      </div>

      <ReportFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <ReportSkeleton rows={5} />
      ) : !reportData || (!summary && rows.length === 0) ? (
        <EmptyReport message="No course data available" onReset={() => setFilters(INITIAL_FILTERS)} />
      ) : (
        <>
          {summary && <ReportSummary summary={summary} />}

          {charts?.monthly && (
            <ReportChart
              data={charts.monthly}
              type="bar"
              dataKey="count"
              nameKey="label"
              title="Monthly Course Creation"
            />
          )}

          {charts?.categoryDistribution && (
            <ReportChart
              data={charts.categoryDistribution}
              type="pie"
              dataKey="count"
              nameKey="_id"
              title="Courses by Category"
            />
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={16} className="mr-1 inline-block" />
              Course List
            </h3>
            <ReportTable columns={COLUMNS} rows={rows} />
          </div>
        </>
      )}
    </div>
  );
}
