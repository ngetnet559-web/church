import { useState, useEffect, useCallback } from "react";
import { Users, Shield, Calendar, Activity } from "lucide-react";
import { reportService } from "../../services/report.service";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportTable from "../../components/reports/ReportTable";
import ReportSummary from "../../components/reports/ReportSummary";
import ReportChart from "../../components/reports/ReportChart";
import ExportButtons from "../../components/reports/ExportButtons";
import ReportSkeleton from "../../components/reports/ReportSkeleton";
import EmptyReport from "../../components/reports/EmptyReport";

const INITIAL_FILTERS = { _showRole: true, _showStatus: true };
const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "isActive", label: "Active" },
  { key: "createdAt", label: "Created" },
];

export default function UsersReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { _showRole, _showStatus, ...apiFilters } = filters;
      const res = await reportService.getReport("users", apiFilters);
      setReportData(res.data);
    } catch (err) {
      setError(err?.message || "Failed to load users report");
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Report</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Overview of user accounts, roles, and activity
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
            <Users size={24} className="mr-2 inline-block text-indigo-500" />
            Users Report
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Overview of user accounts, roles, and activity
          </p>
        </div>
        <ExportButtons reportType="users" filters={filters} />
      </div>

      <ReportFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <ReportSkeleton rows={5} />
      ) : !reportData || (!summary && rows.length === 0) ? (
        <EmptyReport message="No user data available" onReset={() => setFilters(INITIAL_FILTERS)} />
      ) : (
        <>
          {summary && <ReportSummary summary={summary} />}

          <div className="grid gap-6 lg:grid-cols-2">
            {charts?.roleDistribution && (
              <ReportChart
                data={charts.roleDistribution}
                type="pie"
                dataKey="count"
                nameKey="_id"
                title="Role Distribution"
              />
            )}
            {charts?.monthly && (
              <ReportChart
                data={charts.monthly}
                type="bar"
                dataKey="count"
                nameKey="label"
                title="Monthly Registrations"
              />
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={16} className="mr-1 inline-block" />
              User List
            </h3>
            <ReportTable
              columns={COLUMNS}
              rows={rows}
              rowClassName="transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800/70 dark:hover:text-gray-100 border-b border-gray-200 dark:border-gray-700"
            />
          </div>
        </>
      )}
    </div>
  );
}
