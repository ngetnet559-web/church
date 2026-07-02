import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReceiptViewer from "../../components/finance/ReceiptViewer.jsx";
import { financeApi } from "../../services/finance.service.js";

function DonationDetailPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await financeApi.getDonation(id);
        setDonation(response.data?.donation);
      } catch (err) {
        setError(err.message || "Unable to load donation");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Loading donation...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!donation) return null;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/finance/donations" className="text-sm text-emerald-600 hover:underline">
        ← Back to donations
      </Link>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Donation Details</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Donor", donation.donorName],
            ["Amount", `${donation.amount} ${donation.currency}`],
            ["Type", donation.donationType],
            ["Status", donation.paymentStatus],
            ["Method", donation.paymentMethod],
            ["Receipt", donation.receiptNumber],
            ["Date", new Date(donation.donatedAt).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
        {donation.message ? (
          <p className="mt-4 rounded bg-gray-50 p-3 text-sm italic">{donation.message}</p>
        ) : null}
      </div>
      <ReceiptViewer donationId={id} />
    </div>
  );
}

export default DonationDetailPage;
