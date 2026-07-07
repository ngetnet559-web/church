import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CampaignProgress from "../../components/finance/CampaignProgress.jsx";
import { financeApi } from "../../services/finance.service.js";

function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [campaignRes, analyticsRes] = await Promise.all([
          financeApi.getCampaign(id),
          financeApi.getCampaignAnalytics(id).catch(() => null),
        ]);
        setCampaign(campaignRes.data?.campaign);
        setAnalytics(analyticsRes?.data?.analytics);
      } catch (err) {
        setError(err.message || "Unable to load campaign");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Loading campaign...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!campaign) return null;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/finance/campaigns" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
        ← Back to campaigns
      </Link>
      <div className="rounded-xl border bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        {campaign.featured ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Featured
          </span>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold">{campaign.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-300">{campaign.description}</p>
        <div className="mt-6">
          <CampaignProgress campaigns={[campaign]} />
        </div>
      </div>

      {analytics ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Raised", value: `${analytics.totalRaised} ETB` },
            { label: "Donations", value: analytics.donationCount },
            { label: "Unique Donors", value: analytics.uniqueDonors },
            { label: "Average Gift", value: `${analytics.averageDonation} ETB` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-gray-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-1 text-xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default CampaignDetailPage;
