import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { certificateService } from "../../services/certificate.service.js";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const res = await certificateService.getMyCertificates();
        setCertificates(res.data.certificates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        <p className="mt-1 text-slate-600">
          View your course completion certificates.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          <p>No certificates earned yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {certificate.course?.title}
              </p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">
                Certificate
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Issued {new Date(certificate.issuedDate).toLocaleDateString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Certificate No: {certificate.certificateNumber}
              </p>
              <Link
                to={`/dashboard/certificates/${certificate.id}`}
                className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View Certificate
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
