function CampaignProgress({ campaigns = [] }) {
  if (!campaigns.length) {
    return <p className="text-sm text-gray-500">No active campaigns.</p>;
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div key={campaign.id}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-gray-900">{campaign.title}</span>
            <span className="text-emerald-700">{campaign.progress || 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${Math.min(campaign.progress || 0, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {campaign.currentAmount?.toLocaleString()} /{" "}
            {campaign.goalAmount?.toLocaleString()} {campaign.currency || "ETB"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default CampaignProgress;
