import { Link } from "react-router-dom";

function DonationFailurePage() {
  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
        ✕
      </div>
      <h1 className="text-3xl font-semibold text-red-700">
        Donation was not completed
      </h1>
      <p className="mt-4 text-gray-600">
        Please try again or contact the church office for assistance.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          to="/donate"
          className="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
        >
          Try again
        </Link>
        <Link to="/" className="text-emerald-600 hover:underline">
          Return home
        </Link>
      </div>
    </div>
  );
}

export default DonationFailurePage;
