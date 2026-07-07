function ExpenseTable({ expenses = [], onApprove }) {
  if (!expenses.length) {
    return <p className="text-sm text-gray-500 dark:text-slate-400">No expenses found.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-t hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <td className="px-4 py-3 text-sm">{expense.title}</td>
              <td className="px-4 py-3 text-sm">{expense.category}</td>
              <td className="px-4 py-3 text-sm">{expense.amount} ETB</td>
              <td className="px-4 py-3 text-sm">{expense.status}</td>
              <td className="px-4 py-3 text-sm">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">
                {expense.status === "Pending" && onApprove ? (
                  <button
                    type="button"
                    onClick={() => onApprove(expense.id)}
                    className="text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Approve
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
