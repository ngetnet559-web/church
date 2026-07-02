import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DonationTable from "../../components/finance/DonationTable.jsx";
import { financeApi } from "../../services/finance.service.js";

const FILTERS = {
  paymentStatus: ["", "Pending", "Paid", "Failed", "Refunded"],
  paymentMethod: ["", "Cash", "Bank Transfer", "Stripe", "PayPal", "Chapa", "Telebirr", "CBE Birr"],
  donationType: ["", "General", "Building", "Mission", "Children", "Charity", "Education", "Equipment", "Emergency", "Event", "Other"],
};

function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    donor: "",
    paymentStatus: "",
    paymentMethod: "",
    donationType: "",
  });
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v),
      );
      const response = await financeApi.listDonations(params.toString());
      setDonations(response.data?.donations || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  const handleRefund = async (id) => {
    if (!window.confirm("Refund this donation?")) return;
    try {
      await financeApi.refundDonation(id);
      setMessage("Donation refunded");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await financeApi.approveDonation(id);
      setMessage("Donation approved");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <div>Loading donations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Donations</h1>
        <Link
          to="/donate"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
        >
          Public Donate Page
        </Link>
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Search donor..."
          value={filters.donor}
          onChange={(e) => setFilters({ ...filters, donor: e.target.value })}
        />
        {Object.entries(FILTERS).map(([key, options]) => (
          <select
            key={key}
            className="rounded border px-3 py-2 text-sm"
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
          >
            {options.map((opt) => (
              <option key={opt || "all"} value={opt}>
                {opt || `All ${key}`}
              </option>
            ))}
          </select>
        ))}
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <DonationTable
        donations={donations}
        showActions
        onRefund={handleRefund}
        onApprove={handleApprove}
      />
    </div>
  );
}

export default DonationsPage;
