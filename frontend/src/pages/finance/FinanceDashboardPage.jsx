import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TrendChart from "../../components/charts/TrendChart.jsx";
import FinancialSummary from "../../components/finance/FinancialSummary.jsx";
import IncomeExpenseChart from "../../components/finance/IncomeExpenseChart.jsx";
import CampaignProgress from "../../components/finance/CampaignProgress.jsx";
import RecentDonations from "../../components/finance/RecentDonations.jsx";
import { financeApi } from "../../services/finance.service.js";

function FinanceDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await financeApi.getDashboard();
        setStats(response.data?.stats || null);
      } catch (err) {
        setError(err.message || "Unable to load finance dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading finance dashboard...</p>
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/dashboard/finance/donations"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Manage Donations
          </Link>
          <Link
            to="/dashboard/finance/reports"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            View Reports
          </Link>
        </div>
      </div>

      <FinancialSummary stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeExpenseChart data={stats?.incomeVsExpense} />
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Donation Trend</h3>
          <TrendChart data={stats?.donationTrend || []} valueKey="value" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Expense Trend</h3>
          <TrendChart data={stats?.expenseTrend || []} valueKey="value" />
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Campaign Progress</h3>
          <CampaignProgress campaigns={stats?.campaignProgressList || []} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Recent Donations</h3>
          <RecentDonations donations={stats?.recentDonations || []} />
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Largest Donations</h3>
          <RecentDonations donations={stats?.largestDonations || []} />
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboardPage;
