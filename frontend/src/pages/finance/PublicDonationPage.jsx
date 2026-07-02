import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignCard from "../../components/finance/CampaignCard.jsx";
import { financeApi } from "../../services/finance.service.js";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Stripe", "PayPal", "Chapa", "Telebirr", "CBE Birr"];
const DONATION_TYPES = ["General", "Building", "Mission", "Children", "Charity", "Education", "Equipment", "Emergency", "Event", "Other"];

function PublicDonationPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    paymentMethod: "Cash",
    donationType: "General",
    campaignId: "",
    anonymous: false,
    message: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await financeApi.listCampaigns("active=true");
        setCampaigns(response.data?.campaigns || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const isOffline = ["Cash", "Bank Transfer"].includes(form.paymentMethod);
      const response = await financeApi.createDonation({
        ...form,
        amount: Number(form.amount),
        paymentStatus: isOffline ? "Pending" : "Pending",
      });

      if (response.data?.payment?.paymentUrl && !isOffline) {
        navigate("/donation-success", {
          state: { donation: response.data.donation, payment: response.data.payment },
        });
      } else {
        navigate("/donation-success", {
          state: { donation: response.data?.donation },
        });
      }
    } catch (err) {
      setError(err.message || "Unable to submit donation");
      navigate("/donation-failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-xl bg-emerald-600 p-8 text-white">
        <h1 className="text-3xl font-semibold">Support the Church</h1>
        <p className="mt-2 text-emerald-100">
          Your generosity helps grow the ministry and serve the community.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Campaigns</h2>
          {campaigns.filter((c) => c.active).length ? (
            campaigns.filter((c) => c.active).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          ) : (
            <p className="text-sm text-gray-500">No active campaigns at this time.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold">Make a Donation</h2>
          {!form.anonymous ? (
            <>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Your name *"
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                required
              />
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Email"
                type="email"
                value={form.donorEmail}
                onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
              />
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Phone"
                value={form.donorPhone}
                onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
              />
            </>
          ) : null}
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Amount (ETB) *"
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            className="w-full rounded border px-3 py-2"
            value={form.donationType}
            onChange={(e) => setForm({ ...form, donationType: e.target.value })}
          >
            {DONATION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            className="w-full rounded border px-3 py-2"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <select
            className="w-full rounded border px-3 py-2"
            value={form.campaignId}
            onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
          >
            <option value="">General Donation</option>
            {campaigns.filter((c) => c.active).map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
            ))}
          </select>
          <textarea
            className="w-full rounded border px-3 py-2"
            placeholder="Leave a prayer or message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
            />
            Donate anonymously
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Donate Now"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}

export default PublicDonationPage;
