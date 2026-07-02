import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { certificateService } from '../../services/certificate.service.js';
import CertificatePrintable from '../../components/certificates/CertificatePrintable.jsx';

export default function CertificateDetailPage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const res = await certificateService.getCertificateById(id);
        setCertificate(res.data.certificate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    );
  }

  if (!certificate) {
    return <div className="text-center text-slate-600">Certificate not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <Link to="/dashboard/certificates" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            ← Back to certificates
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Certificate Detail</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Download / Print PDF
          </button>
          <Link
            to={`/certificate-verify/${certificate.verificationCode}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Verify Certificate
          </Link>
        </div>
      </div>

      <CertificatePrintable certificate={certificate} />
    </div>
  );
}
