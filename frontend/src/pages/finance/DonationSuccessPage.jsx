import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function DonationSuccessPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const donation = location.state?.donation;

  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        ✓
      </div>
      <h1 className="text-3xl font-semibold text-emerald-700 dark:text-emerald-300">
        Thank you for your donation
      </h1>
      <p className="mt-4 text-gray-600 dark:text-slate-300">
        Your gift has been received and a receipt will be prepared shortly.
      </p>
      {donation ? (
        <div className="mt-6 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-500 dark:text-slate-400">Receipt Number</p>
          <p className="font-semibold">{donation.receiptNumber}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Amount</p>
          <p className="font-semibold">
            {donation.amount} {donation.currency || "ETB"}
          </p>
        </div>
      ) : null}
      <div className="mt-6 flex justify-center gap-4">
        <Link to="/" className="text-emerald-600 hover:underline dark:text-emerald-400">
          Return home
        </Link>
        <Link to="/donate" className="text-emerald-600 hover:underline dark:text-emerald-400">
          Make another donation
        </Link>
        {isAuthenticated && (
          <Link
            to="/dashboard/my-donations"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            View Your Giving History
          </Link>
        )}
      </div>
    </div>
  );
}

export default DonationSuccessPage;
