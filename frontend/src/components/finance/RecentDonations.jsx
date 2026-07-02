import DonationCard from "./DonationCard.jsx";

function RecentDonations({ donations = [], onSelect }) {
  if (!donations.length) {
    return <p className="text-sm text-gray-500">No recent donations.</p>;
  }

  return (
    <div className="space-y-3">
      {donations.map((donation) => (
        <DonationCard
          key={donation.id}
          donation={donation}
          onClick={onSelect ? () => onSelect(donation) : undefined}
        />
      ))}
    </div>
  );
}

export default RecentDonations;
