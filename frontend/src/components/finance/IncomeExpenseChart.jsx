import BarChart from "../charts/BarChart.jsx";

function IncomeExpenseChart({ data }) {
  if (!data) return null;

  const chartData = [
    { label: "Income", value: data.income || 0 },
    { label: "Expenses", value: data.expenses || 0 },
    { label: "Net", value: data.net || 0 },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">Income vs Expense</h3>
      <BarChart data={chartData} valueKey="value" />
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-gray-500">Income</p>
          <p className="font-semibold text-emerald-600">
            {(data.income || 0).toLocaleString()} ETB
          </p>
        </div>
        <div>
          <p className="text-gray-500">Expenses</p>
          <p className="font-semibold text-red-600">
            {(data.expenses || 0).toLocaleString()} ETB
          </p>
        </div>
        <div>
          <p className="text-gray-500">Net</p>
          <p className="font-semibold text-gray-900">
            {(data.net || 0).toLocaleString()} ETB
          </p>
        </div>
      </div>
    </div>
  );
}

export default IncomeExpenseChart;
