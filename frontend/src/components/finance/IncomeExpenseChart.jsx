import BarChart from "../charts/BarChart.jsx";

function IncomeExpenseChart({ data }) {
  if (!data) return null;

  const chartData = [
    { label: "Income", value: data.income || 0 },
    { label: "Expenses", value: data.expenses || 0 },
    { label: "Net", value: data.net || 0 },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Income vs Expense</h3>
      <BarChart data={chartData} valueKey="value" />
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-gray-500 dark:text-slate-400">Income</p>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
            {(data.income || 0).toLocaleString()} ETB
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-slate-400">Expenses</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            {(data.expenses || 0).toLocaleString()} ETB
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-slate-400">Net</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {(data.net || 0).toLocaleString()} ETB
          </p>
        </div>
      </div>
    </div>
  );
}

export default IncomeExpenseChart;
