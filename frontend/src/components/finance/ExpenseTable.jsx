function ExpenseTable({ expenses = [], onApprove }) {
  if (!expenses.length) {
    return <p className="text-sm text-gray-500">No expenses found.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
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
            <tr key={expense.id} className="border-t hover:bg-gray-50">
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
                    className="text-emerald-600 hover:underline"
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
