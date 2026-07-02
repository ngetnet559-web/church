import { useEffect, useState } from "react";
import BudgetCard from "../../components/finance/BudgetCard.jsx";
import BudgetProgress from "../../components/finance/BudgetProgress.jsx";
import { financeApi } from "../../services/finance.service.js";

const initialForm = {
  title: "",
  fiscalYear: new Date().getFullYear().toString(),
  category: "General",
  allocatedAmount: "",
  warningThreshold: 80,
};

function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const loadBudgets = async () => {
    try {
      const [budgetRes, summaryRes] = await Promise.all([
        financeApi.listBudgets(),
        financeApi.getBudgetSummary(),
      ]);
      setBudgets(budgetRes.data?.budgets || []);
      setSummary(summaryRes.data?.summary);
    } catch (error) {
      setMessage(error.message || "Unable to load budgets");
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await financeApi.createBudget({
        ...form,
        allocatedAmount: Number(form.allocatedAmount),
        warningThreshold: Number(form.warningThreshold),
      });
      setForm(initialForm);
      setMessage("Budget created successfully");
      loadBudgets();
    } catch (error) {
      setMessage(error.message || "Unable to create budget");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Budget Management</h1>

      {summary ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Allocated", value: summary.totalAllocated },
            { label: "Total Spent", value: summary.totalSpent },
            { label: "Remaining", value: summary.totalRemaining },
            { label: "Warnings", value: summary.warningCount },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold">{item.value?.toLocaleString()} ETB</p>
            </div>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Budget title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="rounded border px-3 py-2" placeholder="Fiscal year" value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })} required />
          <input className="rounded border px-3 py-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="Allocated amount" type="number" value={form.allocatedAmount} onChange={(e) => setForm({ ...form, allocatedAmount: e.target.value })} required />
        </div>
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 font-medium text-white">Save Budget</button>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Budget Usage Overview</h2>
        <BudgetProgress budgets={budgets} />
      </div>
    </div>
  );
}

export default BudgetsPage;
