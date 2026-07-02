function ExpenseCard({ expense, onApprove }) {
  const statusColors = {
    Pending: "bg-amber-100 text-amber-800",
    Approved: "bg-emerald-100 text-emerald-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{expense.title}</p>
          <p className="text-sm text-gray-500">{expense.category}</p>
        </div>
        <span className="text-lg font-semibold text-gray-900">
          {expense.amount?.toLocaleString()} ETB
        </span>
      </div>
      {expense.description ? (
        <p className="mt-2 text-sm text-gray-600">{expense.description}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[expense.status] || "bg-gray-100 text-gray-700"}`}
        >
          {expense.status}
        </span>
        {expense.status === "Pending" && onApprove ? (
          <button
            type="button"
            onClick={() => onApprove(expense.id)}
            className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
          >
            Approve
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default ExpenseCard;
