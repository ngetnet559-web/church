import { useState, useCallback, useEffect } from "react";
import { DollarSign, TrendingUp, Receipt, BarChart3 } from "lucide-react";
import { reportService } from "../../services/report.service";
import ReportFilters from "../../components/reports/ReportFilters.jsx";
import ReportSummary from "../../components/reports/ReportSummary.jsx";
import ReportChart from "../../components/reports/ReportChart.jsx";
import ExportButtons from "../../components/reports/ExportButtons.jsx";
import ReportSkeleton from "../../components/reports/ReportSkeleton.jsx";
import EmptyReport from "../../components/reports/EmptyReport.jsx";

export default function FinanceReport() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getReport("finance", filters);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load finance report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ReportSkeleton rows={3} />;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Report</h1>
          <ExportButtons reportType="finance" filters={filters} />
        </div>
        <ReportFilters filters={filters} onChange={setFilters} />
        <EmptyReport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Report</h1>
        <ExportButtons reportType="finance" filters={filters} />
      </div>

      <ReportFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={DollarSign} label="Total Donations" value={summary.totalDonations} color="text-emerald-500" />
        <StatCard icon={Receipt} label="Total Expenses" value={summary.totalExpenses} color="text-red-500" />
        <StatCard icon={BarChart3} label="Balance" value={summary.balance} color="text-indigo-500" />
        <StatCard icon={TrendingUp} label="Donation Count" value={summary.donationCount} color="text-blue-500" />
        <StatCard icon={TrendingUp} label="Expense Count" value={summary.expenseCount} color="text-orange-500" />
      </div>

      {summary.donationTrend && summary.expenseTrend && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ReportChart
            data={summary.donationTrend}
            type="line"
            dataKey="amount"
            title="Donation Trend"
          />
          <ReportChart
            data={summary.expenseTrend}
            type="line"
            dataKey="amount"
            title="Expense Trend"
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
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {value?.toLocaleString() ?? "—"}
      </p>
    </div>
  );
}
