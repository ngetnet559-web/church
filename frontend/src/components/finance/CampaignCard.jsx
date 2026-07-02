import { Link } from "react-router-dom";

function CampaignCard({ campaign, linkPrefix = "/campaigns" }) {
  const progress = campaign.progress || 0;

  return (
    <Link
      to={`${linkPrefix}/${campaign.id}`}
      className="block rounded-xl border bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      {campaign.featured ? (
        <span className="mb-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          Featured
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{campaign.description}</p>
      <div className="mt-4 h-2 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>
          {campaign.currentAmount?.toLocaleString()} / {campaign.goalAmount?.toLocaleString()}{" "}
          {campaign.currency || "ETB"}
        </span>
        <span className="font-medium text-emerald-700">{progress}%</span>
      </div>
      {!campaign.active ? (
        <p className="mt-2 text-xs text-red-500">Campaign closed</p>
      ) : null}
    </Link>
  );
}

export default CampaignCard;
