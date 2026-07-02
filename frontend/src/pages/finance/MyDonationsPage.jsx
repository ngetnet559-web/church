import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DonationTable from "../../components/finance/DonationTable.jsx";
import CampaignCard from "../../components/finance/CampaignCard.jsx";
import { financeApi } from "../../services/finance.service.js";

function MyDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [donationsRes, statsRes, campaignsRes] = await Promise.all([
          financeApi.getMyDonations(),
          financeApi.getMyStatistics(),
          financeApi.listCampaigns("active=true"),
        ]);
        setDonations(donationsRes.data?.donations || []);
        setStatistics(statsRes.data?.statistics);
        setCampaigns(campaignsRes.data?.campaigns || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading your giving history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Donations</h1>
        <Link
          to="/donate"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
        >
          Make a Donation
        </Link>
      </div>

      {statistics ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Given", value: statistics.total },
            { label: "This Month", value: statistics.thisMonth },
            { label: "This Year", value: statistics.thisYear },
            { label: "Gifts", value: statistics.count },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold">
                {typeof item.value === "number" && item.label !== "Gifts"
                  ? `${item.value.toLocaleString()} ETB`
                  : item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Giving History</h2>
        <DonationTable donations={donations} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Supported Campaigns</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.slice(0, 4).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} linkPrefix="/campaigns" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyDonationsPage;
