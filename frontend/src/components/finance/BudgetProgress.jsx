function BudgetProgress({ budgets = [] }) {
  if (!budgets.length) {
    return <p className="text-sm text-gray-500 dark:text-slate-400">No budgets configured.</p>;
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const usage = budget.usagePercent || 0;
        const color = budget.isWarning ? "bg-red-500" : "bg-emerald-500";
        return (
          <div key={budget.id} className="rounded-lg border p-3 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{budget.title}</span>
              <span>{usage}% used</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-slate-700">
              <div
                className={`h-2 rounded-full ${color}`}
                style={{ width: `${Math.min(usage, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BudgetProgress;
