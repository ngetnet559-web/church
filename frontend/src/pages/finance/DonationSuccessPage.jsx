import { Link, useLocation } from "react-router-dom";

function DonationSuccessPage() {
  const location = useLocation();
  const donation = location.state?.donation;

  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
        ✓
      </div>
      <h1 className="text-3xl font-semibold text-emerald-700">
        Thank you for your donation
      </h1>
      <p className="mt-4 text-gray-600">
        Your gift has been received and a receipt will be prepared shortly.
      </p>
      {donation ? (
        <div className="mt-6 rounded-xl border bg-white p-4 text-left shadow-sm">
          <p className="text-sm text-gray-500">Receipt Number</p>
          <p className="font-semibold">{donation.receiptNumber}</p>
          <p className="mt-2 text-sm text-gray-500">Amount</p>
          <p className="font-semibold">
            {donation.amount} {donation.currency || "ETB"}
          </p>
        </div>
      ) : null}
      <div className="mt-6 flex justify-center gap-4">
        <Link to="/" className="text-emerald-600 hover:underline">
          Return home
        </Link>
        <Link to="/donate" className="text-emerald-600 hover:underline">
          Make another donation
        </Link>
      </div>
    </div>
  );
}

export default DonationSuccessPage;
