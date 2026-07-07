function DonationCard({ donation, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{donation.donorName}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{donation.donationType}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {donation.amount} {donation.currency || "ETB"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-400">
        <span>{donation.paymentMethod}</span>
        <span>•</span>
        <span>{donation.paymentStatus}</span>
        {donation.campaign?.title ? (
          <>
            <span>•</span>
            <span>{donation.campaign.title}</span>
          </>
        ) : null}
      </div>
    </button>
  );
}

export default DonationCard;
