import { useState, useCallback, useEffect } from "react";
import { DollarSign, Gift, PieChart, TrendingUp } from "lucide-react";
import { reportService } from "../../services/report.service";
import ReportFilters from "../../components/reports/ReportFilters.jsx";
import ReportTable from "../../components/reports/ReportTable.jsx";
import ReportSummary from "../../components/reports/ReportSummary.jsx";
import ReportChart from "../../components/reports/ReportChart.jsx";
import ExportButtons from "../../components/reports/ExportButtons.jsx";
import ReportSkeleton from "../../components/reports/ReportSkeleton.jsx";
import EmptyReport from "../../components/reports/EmptyReport.jsx";

const paymentMethods = ["Cash", "Bank Transfer", "Mobile Money", "Credit Card", "Other"];
const statuses = ["Pending", "Paid", "Failed", "Refunded"];

const columns = [
  { key: "donorName", label: "Donor" },
  { key: "donorEmail", label: "Email" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  { key: "paymentMethod", label: "Method" },
  { key: "paymentStatus", label: "Status" },
  { key: "donatedAt", label: "Date" },
];

export default function DonationReport() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    _showPayment: true,
    _showCampaign: true,
    _showStatus: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getReport("donations", filters);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load donation report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ReportSkeleton rows={5} />;

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
  const rows = data?.rows;

  if ((!summary || Object.keys(summary).length === 0) && (!rows || rows.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donation Report</h1>
          <ExportButtons reportType="donations" filters={filters} />
        </div>
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          paymentMethods={paymentMethods}
          statuses={statuses}
        />
        <EmptyReport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donation Report</h1>
        <ExportButtons reportType="donations" filters={filters} />
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        paymentMethods={paymentMethods}
        statuses={statuses}
      />

      <ReportSummary summary={summary} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gift} label="Total Donations" value={summary?.total} color="text-purple-500" />
        <StatCard icon={DollarSign} label="Total Amount" value={summary?.totalAmount} color="text-emerald-500" />
      </div>

      {summary?.byPaymentMethod && (
        <div className="grid gap-6 lg:grid-cols-1">
          <ReportChart
            data={summary.byPaymentMethod}
            type="pie"
            dataKey="amount"
            title="Donations by Payment Method"
          />
        </div>
      )}

      {rows && rows.length > 0 && (
        <ReportTable columns={columns} rows={rows} />
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
