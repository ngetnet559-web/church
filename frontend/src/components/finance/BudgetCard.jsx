function BudgetCard({ budget }) {
  const usage = budget.usagePercent || 0;
  const barColor = budget.isWarning ? "bg-red-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{budget.title}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {budget.category} • FY {budget.fiscalYear}
          </p>
        </div>
        {budget.isWarning ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
            Warning
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
          <span>Spent: {budget.spentAmount?.toLocaleString()} ETB</span>
          <span>{usage}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-slate-700">
          <div
            className={`h-2 rounded-full ${barColor}`}
            style={{ width: `${Math.min(usage, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Remaining: {budget.remainingAmount?.toLocaleString()} /{" "}
          {budget.allocatedAmount?.toLocaleString()} ETB
        </p>
      </div>
    </div>
  );
}

export default BudgetCard;
