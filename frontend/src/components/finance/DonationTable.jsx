function DonationTable({ donations = [], onRefund, onApprove, showActions = false }) {
  if (!donations.length) {
    return <p className="text-sm text-gray-500">No donations found.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Donor</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            {showActions ? (
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{donation.donorName}</td>
              <td className="px-4 py-3 text-sm">
                {donation.amount} {donation.currency}
              </td>
              <td className="px-4 py-3 text-sm">{donation.donationType}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    donation.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : donation.paymentStatus === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {donation.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{donation.paymentMethod}</td>
              <td className="px-4 py-3 text-sm">
                {new Date(donation.donatedAt).toLocaleDateString()}
              </td>
              {showActions ? (
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {donation.paymentStatus === "Pending" && onApprove ? (
                      <button
                        type="button"
                        onClick={() => onApprove(donation.id)}
                        className="text-emerald-600 hover:underline"
                      >
                        Approve
                      </button>
                    ) : null}
                    {donation.paymentStatus === "Paid" && onRefund ? (
                      <button
                        type="button"
                        onClick={() => onRefund(donation.id)}
                        className="text-red-600 hover:underline"
                      >
                        Refund
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonationTable;
