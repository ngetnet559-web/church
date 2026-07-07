import { useEffect, useState } from "react";
import CampaignCard from "../../components/finance/CampaignCard.jsx";
import { financeApi } from "../../services/finance.service.js";

function PublicCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Loading campaigns...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-xl bg-emerald-600 p-8 text-white">
        <h1 className="text-3xl font-semibold">Donation Campaigns</h1>
        <p className="mt-2 text-emerald-100">
          Support our active ministry campaigns and track their progress.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.length ? (
          campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        ) : (
          <p className="text-gray-500 dark:text-slate-400">No active campaigns at this time.</p>
        )}
      </div>
    </div>
  );
}

export default PublicCampaignsPage;
