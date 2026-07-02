function FinancialSummary({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Donations", value: stats.totalDonations, prefix: "ETB " },
    { label: "Today's Donations", value: stats.todaysDonations, prefix: "ETB " },
    { label: "Monthly Donations", value: stats.monthlyDonations, prefix: "ETB " },
    { label: "Yearly Donations", value: stats.yearlyDonations, prefix: "ETB " },
    { label: "Total Expenses", value: stats.totalExpenses, prefix: "ETB " },
    { label: "Budget Remaining", value: stats.budgetRemaining, prefix: "ETB " },
    { label: "Active Campaigns", value: stats.activeCampaigns },
    { label: "Campaign Progress", value: stats.campaignProgress, suffix: "%" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {card.prefix || ""}
            {(card.value ?? 0).toLocaleString()}
            {card.suffix || ""}
          </p>
        </div>
      ))}
    </div>
  );
}

export default FinancialSummary;
