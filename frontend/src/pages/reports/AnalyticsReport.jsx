import { useState, useCallback, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Award, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import { reportService } from "../../services/report.service";
import ReportFilters from "../../components/reports/ReportFilters.jsx";
import ReportChart from "../../components/reports/ReportChart.jsx";
import ExportButtons from "../../components/reports/ExportButtons.jsx";
import ReportSkeleton from "../../components/reports/ReportSkeleton.jsx";
import EmptyReport from "../../components/reports/EmptyReport.jsx";

export default function AnalyticsReport() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getReport("analytics", filters);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load analytics report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ReportSkeleton rows={4} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={load}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary;

  if (!summary || Object.keys(summary).length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Report</h1>
          <ExportButtons reportType="analytics" filters={filters} />
        </div>
        <ReportFilters filters={filters} onChange={setFilters} />
        <EmptyReport />
      </div>
    );
  }

  const rateCards = [
    { icon: TrendingUp, label: "Completion Rate", value: summary.completionRate, suffix: "%", color: "text-emerald-500" },
    { icon: Activity, label: "Attendance Rate", value: summary.attendanceRate, suffix: "%", color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Report</h1>
        <ExportButtons reportType="analytics" filters={filters} />
      </div>

      <ReportFilters filters={filters} onChange={setFilters} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Platform Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={summary.totalUsers} color="text-indigo-500" />
          <StatCard icon={BookOpen} label="Total Courses" value={summary.totalCourses} color="text-purple-500" />
          <StatCard icon={GraduationCap} label="Enrollments" value={summary.totalEnrollments} color="text-green-500" />
          <StatCard icon={Award} label="Certificates" value={summary.totalCertificates} color="text-amber-500" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rateCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {card.value != null ? `${card.value}${card.suffix}` : "—"}
            </p>
          </div>
        ))}
      </div>

      {summary.roleDistribution && (
        <div className="grid gap-6 lg:grid-cols-1">
          <ReportChart
            data={summary.roleDistribution}
            type="pie"
            dataKey="count"
            nameKey="_id"
            title="User Role Distribution"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <Icon size={20} className={color} />
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {value?.toLocaleString() ?? "—"}
      </p>
    </div>
  );
}
