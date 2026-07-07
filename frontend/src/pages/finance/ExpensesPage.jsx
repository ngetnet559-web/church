import { useEffect, useState } from "react";
import ExpenseTable from "../../components/finance/ExpenseTable.jsx";
import { financeApi } from "../../services/finance.service.js";

const CATEGORIES = [
  "Utilities", "Teaching Materials", "Maintenance", "Equipment",
  "Salary", "Transport", "Internet", "Food", "Charity", "Event", "Mission", "Emergency", "Other",
];

const initialForm = {
  title: "",
  description: "",
  amount: "",
  category: "Other",
  paymentMethod: "Cash",
  receiptImage: "",
  expenseDate: "",
};

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const loadExpenses = async () => {
    try {
      const response = await financeApi.listExpenses();
      setExpenses(response.data?.expenses || []);
    } catch (error) {
      setMessage(error.message || "Unable to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await financeApi.createExpense({ ...form, amount: Number(form.amount) });
      setForm(initialForm);
      setMessage("Expense recorded successfully");
      loadExpenses();
    } catch (error) {
      setMessage(error.message || "Unable to create expense");
    }
  };

  const approveExpense = async (expenseId) => {
    try {
      await financeApi.approveExpense(expenseId);
      setMessage("Expense approved");
      loadExpenses();
    } catch (error) {
      setMessage(error.message || "Unable to approve expense");
    }
  };

  if (loading) return <div>Loading expenses...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Expense Management</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            {["Cash", "Bank Transfer", "Other"].map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <input
            className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            type="date"
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
          />
          <input
            className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Receipt image URL"
            value={form.receiptImage}
            onChange={(e) => setForm({ ...form, receiptImage: e.target.value })}
          />
        </div>
        <textarea
          className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 font-medium text-white dark:bg-slate-700">
          Save Expense
        </button>
        {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      </form>

      <ExpenseTable expenses={expenses} onApprove={approveExpense} />
    </div>
  );
}

export default ExpensesPage;
