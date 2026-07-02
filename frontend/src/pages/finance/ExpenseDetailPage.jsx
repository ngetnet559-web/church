import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ExpenseCard from "../../components/finance/ExpenseCard.jsx";
import { financeApi } from "../../services/finance.service.js";

function ExpenseDetailPage() {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await financeApi.getExpense(id);
        setExpense(response.data?.expense);
      } catch (err) {
        setError(err.message || "Unable to load expense");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    await financeApi.approveExpense(id);
    setExpense({ ...expense, status: "Approved" });
  };

  if (loading) return <div>Loading expense...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/finance/expenses" className="text-sm text-emerald-600 hover:underline">
        ← Back to expenses
      </Link>
      <ExpenseCard expense={expense} onApprove={expense.status === "Pending" ? handleApprove : undefined} />
    </div>
  );
}

export default ExpenseDetailPage;
