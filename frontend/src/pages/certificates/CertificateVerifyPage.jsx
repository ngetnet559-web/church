import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { certificateService } from "../../services/certificate.service.js";

export default function CertificateVerifyPage() {
  const { code } = useParams();
  const [verificationCode, setVerificationCode] = useState(code || "");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      verify(code);
    }
  }, [code]);

  const verify = async (verificationCodeToCheck) => {
    try {
      setLoading(true);
      setError("");
      const res = await certificateService.verifyCertificate(
        verificationCodeToCheck,
      );
      setCertificate(res.data.certificate);
    } catch (err) {
      setCertificate(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!verificationCode.trim()) {
      return;
    }
    verify(verificationCode.trim());
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Verify Certificate
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Enter a certificate verification code to confirm the student and
          course.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Verification Code
          </label>
          <input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
            placeholder="Enter verification code"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Verify
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      ) : certificate ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Verified Certificate
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Student</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                {certificate.student?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Course</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                {certificate.course?.title || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Issued Date</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                {new Date(certificate.issuedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Verification Code</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                {certificate.verificationCode}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Certificate Number</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {certificate.certificateNumber}
            </p>
          </div>
        </div>
      ) : null}

      <div className="text-sm text-slate-500 dark:text-slate-400">
        <Link
          className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
