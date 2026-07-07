import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CampaignProgress from "../../components/finance/CampaignProgress.jsx";
import { financeApi } from "../../services/finance.service.js";

function PublicCampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await financeApi.getCampaign(id);
        setCampaign(response.data?.campaign);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!campaign) return <div className="p-8 text-center">Campaign not found</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link to="/campaigns" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
        ← All campaigns
      </Link>
      <div className="rounded-xl border bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">{campaign.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-300">{campaign.description}</p>
        <div className="mt-6">
          <CampaignProgress campaigns={[campaign]} />
        </div>
        <Link
          to="/donate"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Donate to this campaign
        </Link>
      </div>
    </div>
  );
}

export default PublicCampaignDetailPage;
