import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CampaignCard from "../../components/finance/CampaignCard.jsx";
import { financeApi } from "../../services/finance.service.js";

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    currency: "ETB",
    featured: false,
  });
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const response = await financeApi.listCampaigns();
      setCampaigns(response.data?.campaigns || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await financeApi.createCampaign({
        ...form,
        goalAmount: Number(form.goalAmount),
      });
      setForm({ title: "", description: "", goalAmount: "", currency: "ETB", featured: false });
      setShowForm(false);
      setMessage("Campaign created successfully");
      load();
    } catch (err) {
      setMessage(err.message || "Unable to create campaign");
    }
  };

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Donation Campaigns</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          {showForm ? "Cancel" : "New Campaign"}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900"
        >
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Campaign title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded border px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Goal amount"
              type="number"
              value={form.goalAmount}
              onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured campaign
            </label>
          </div>
          <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-700">
            Create Campaign
          </button>
        </form>
      ) : null}

      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            linkPrefix="/dashboard/finance/campaigns"
          />
        ))}
      </div>
    </div>
  );
}

export default CampaignsPage;
